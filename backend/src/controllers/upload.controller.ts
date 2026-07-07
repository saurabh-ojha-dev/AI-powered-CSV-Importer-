import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import Papa from "papaparse";
import type { ImportResponse, CrmLead, SkippedRow } from "../types/crm.types.js";
import { chunkRows } from "../services/chunker.service.js";
import { processBatch } from "../services/llm.service.js";
import { validateLeads } from "../services/validator.service.js";

const BATCH_SIZE = 25;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are accepted"));
    }
  },
}).single("file");

export function handleUpload(req: Request, res: Response, next: NextFunction) {
  upload(req, res, async (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No CSV file provided. Send as multipart/form-data with field name 'file'" });
      return;
    }

    try {
      const csvText = req.file.buffer.toString("utf-8");

      const parsed = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (h: string) => h.trim(),
      });

      const rows = parsed.data.filter((row) =>
        Object.values(row).some((val) => val?.trim())
      );

      if (rows.length === 0) {
        res.status(400).json({ error: "CSV file is empty or contains no valid rows" });
        return;
      }

      const headers = parsed.meta.fields ?? Object.keys(rows[0]);

      console.log(`[upload] Parsed ${rows.length} rows with ${headers.length} columns from ${req.file.originalname}`);

      const result = await processRows(rows, headers);
      res.json(result);
    } catch (e) {
      next(e);
    }
  });
}

export async function processRows(
  rows: Record<string, string>[],
  headers: string[]
): Promise<ImportResponse> {
  console.log(`[import] Starting import of ${rows.length} rows in batches of ${BATCH_SIZE}`);

  const batches = chunkRows(rows, BATCH_SIZE);
  const allImported: CrmLead[] = [];
  const allSkipped: SkippedRow[] = [];
  let processedRows = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchStart = processedRows;

    console.log(`[import] Processing batch ${i + 1}/${batches.length} (${batch.length} rows)`);

    try {
      const mapped = await processBatch(batch, headers);
      const { valid, skipped } = validateLeads(mapped, batchStart);
      allImported.push(...valid);
      allSkipped.push(...skipped);
    } catch (err) {
      const reason = err instanceof Error ? err.message : "LLM processing failed";
      for (let j = 0; j < batch.length; j++) {
        allSkipped.push({
          originalIndex: batchStart + j,
          row: batch[j],
          reason,
        });
      }
      console.error(`[import] Batch ${i + 1} failed entirely: ${reason}`);
    }

    processedRows += batch.length;

    if (i < batches.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`[import] Done — ${allImported.length} imported, ${allSkipped.length} skipped`);

  return {
    imported: allImported,
    skipped: allSkipped,
    stats: {
      total: rows.length,
      imported: allImported.length,
      skipped: allSkipped.length,
    },
  };
}
