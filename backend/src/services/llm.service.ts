import { GoogleGenAI } from "@google/genai";
import type { CrmLead } from "../types/crm.types.js";
import { buildMappingPrompt } from "../prompts/csvMapping.prompt.js";

const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

/**
 * Sends a batch of raw CSV rows to Gemini and gets back structured CRM leads.
 * Uses structured JSON output mode so we don't have to parse markdown fences.
 * Retries with exponential backoff on transient failures.
 */
export async function processBatch(
  rows: Record<string, string>[],
  headers: string[]
): Promise<CrmLead[]> {
  const ai = getClient();
  const systemPrompt = buildMappingPrompt(headers);

  const userContent = JSON.stringify(rows);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [{ text: userContent }],
          },
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.1, // low temp for deterministic mapping
        },
      });

      const text = response.text ?? "";
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        throw new Error("LLM returned non-array JSON");
      }

      return parsed as CrmLead[];
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[llm] Batch attempt ${attempt}/${MAX_RETRIES} failed: ${lastError.message}`
      );

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }

  throw new Error(
    `LLM processing failed after ${MAX_RETRIES} retries: ${lastError?.message}`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
