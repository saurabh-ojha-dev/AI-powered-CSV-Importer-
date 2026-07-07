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

app.get("/", (_req, res) => {
  res.send(`
    <html>
      <body style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f8fafc; color: #0f172a;">
        <h1>🚀 CSV Importer Backend is Running!</h1>
        <p>The API is active. Head over to the frontend application to start uploading CSVs.</p>
        <div style="margin-top: 20px; padding: 15px; background: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <strong>Available Endpoints:</strong>
          <ul style="margin-top: 10px;">
            <li><code>POST /api/upload</code> - Upload a raw CSV file</li>
            <li><code>POST /api/import</code> - Send JSON parsed rows</li>
            <li><code>GET /health</code> - Check server health</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[server] CSV Importer backend running on http://localhost:${PORT}`);
});
