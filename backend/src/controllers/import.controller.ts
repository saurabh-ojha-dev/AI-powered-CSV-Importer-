import type { Request, Response, NextFunction } from "express";
import type { ImportRequest } from "../types/crm.types.js";
import { processRows } from "./upload.controller.js";

export async function handleImport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { rows, headers } = req.body as ImportRequest;

    if (!rows?.length || !headers?.length) {
      res.status(400).json({ error: "Request must include non-empty `rows` and `headers` arrays" });
      return;
    }

    const result = await processRows(rows, headers);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
