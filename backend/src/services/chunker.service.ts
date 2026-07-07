/**
 * Splits an array into fixed-size chunks for batched LLM processing.
 * Pure function — no side effects, no dependencies.
 */
export function chunkRows<T>(rows: T[], batchSize = 25): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < rows.length; i += batchSize) {
    chunks.push(rows.slice(i, i + batchSize));
  }

  return chunks;
}
