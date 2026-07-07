import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleImport } from "./controllers/import.controller.js";
import { handleUpload } from "./controllers/upload.controller.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

const PORT = parseInt(process.env.PORT ?? "4000", 10);

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json({ limit: "50mb" }));

// JSON body route — frontend sends pre-parsed rows
app.post("/api/import", apiLimiter, handleImport);

// Multipart file upload route — accepts raw .csv file
app.post("/api/upload", apiLimiter, handleUpload);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server] CSV Importer backend running on http://localhost:${PORT}`);
});
