import type { Request, Response, NextFunction } from "express";

/**
 * Global error handler — catches anything that slips past controllers.
 * Logs the full stack server-side, returns a clean JSON error to the client.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("[error]", err.stack ?? err.message);

  const status = (err as NodeJS.ErrnoException).code === "LIMIT_FILE_SIZE" ? 413 : 500;

  res.status(status).json({
    error: err.message || "Internal server error",
  });
}
