<img width="1917" height="882" alt="Screenshot 2026-07-07 143118" src="https://github.com/user-attachments/assets/6aba2534-98f4-42bc-96c2-17b52d70e9a4" />

<img width="1917" height="885" alt="Screenshot 2026-07-07 143011" src="https://github.com/user-attachments/assets/08020ebe-8542-47a2-80e9-33e388b81457" />

# AI-Powered CSV Importer

A full-stack application that transforms messy CSV files into structured CRM lead data using AI (Google Gemini). Upload any CSV — the AI figures out the column mapping.

## Architecture

```
┌────────────────────┐          ┌────────────────────┐          ┌──────────────┐
│   Next.js Client   │  POST    │   Express Server   │  API     │   Gemini AI  │
│                    │ ──────── │                    │ ──────── │              │
│ • Drag & drop CSV  │  /api/   │ • Chunks rows      │  Model   │ • Maps cols  │
│ • Local preview    │  import  │ • Validates leads   │  Call    │ • Cleans     │
│ • Results view     │          │ • Retry w/ backoff  │          │ • Structures │
└────────────────────┘          └────────────────────┘          └──────────────┘
```

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Google Gemini API Key** — Free at [Google AI Studio](https://aistudio.google.com/app/apikey)

## Local Setup Instructions

Follow these step-by-step instructions to get the project running on your local machine.

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd groweasy-assignment
```

### 2. Setup the Backend
The backend requires a Google Gemini API key to process the CSVs.
```bash
cd backend
npm install
```
**Configure Environment Variables:**
1. In the `backend` folder, create the `.env` file.
2. Open `.env` in your code editor and add your API key:
   ```env
   GEMINI_API_KEY=AIzaSy... (paste your actual key here)
   PORT=4000
   FRONTEND_URL=http://localhost:3000
   ```
3. **CRITICAL:** Make sure you **Save** the `.env` file (Ctrl+S or Cmd+S) before continuing!

**Start the Backend Server:**
```bash
npm run dev
```
*(Leave this terminal window running. The backend is now live on `http://localhost:4000`)*

### 3. Setup the Frontend
Open a **new terminal window** (do not close the backend terminal).
```bash
cd groweasy-assignment/frontend
npm install
```
**Configure Environment Variables:**
1. In the `frontend` folder, create the `.env`.
2. Open `.env` and ensure it looks like this:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```
3. **Save** the file.

**Start the Frontend Server:**
```bash
npm run dev
```
*(Leave this terminal window running. The frontend is now live on `http://localhost:3000`)*

### 4. You're Ready!
Open your browser and navigate to [http://localhost:3000](http://localhost:3000). You can now drag and drop CSV files to test the AI importer!

---

## How It Works

1. **Upload** — Drag & drop or pick a CSV file
2. **Preview** — The CSV is parsed locally (Papaparse) and displayed in a scrollable table
3. **Import** — Click "Confirm Import" to send the data to the backend
4. **AI Processing** — The backend chunks rows (25 per batch), sends each to Gemini with a mapping prompt, validates the output
5. **Results** — See imported leads in CRM format + any skipped rows with reasons

## CRM Target Schema

| Field | Description |
|-------|-------------|
| `created_at` | Lead creation date (JS `new Date()` parseable) |
| `name` | Full name |
| `email` | Primary email |
| `country_code` | International dialing code (digits only) |
| `mobile_without_country_code` | Phone without country code |
| `company` | Company name |
| `city` | City |
| `state` | State/province |
| `country` | Country |
| `lead_owner` | Lead owner email |
| `crm_status` | One of: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE` |
| `crm_note` | Consolidated notes + overflow data |
| `data_source` | One of: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots` |
| `possession_time` | Property possession timeline |
| `description` | Additional descriptions |

## Validation Rules

- A row **must** have a valid email OR a valid mobile number — otherwise it's skipped
- If multiple emails/phones exist, the first is used and the rest go into `crm_note`
- `crm_status` and `data_source` are matched to allowed enums or left blank

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── services/          # Business logic (chunking, LLM, validation)
│   │   ├── middleware/        # Error handling, rate limiting
│   │   ├── prompts/           # LLM prompt templates
│   │   └── types/             # TypeScript interfaces & enums
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js pages & layout
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # API client & helpers
│   └── package.json
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

## API Reference

### `POST /api/import`

**Request body:**
```json
{
  "rows": [{ "Name": "John", "Email": "john@example.com", ... }],
  "headers": ["Name", "Email", ...]
}
```

**Response:**
```json
{
  "imported": [{ "name": "John", "email": "john@example.com", ... }],
  "skipped": [{ "originalIndex": 5, "row": {...}, "reason": "Missing email and phone" }],
  "stats": { "total": 100, "imported": 95, "skipped": 5 }
}
```

### `POST /api/upload`

**Request:** `multipart/form-data` with a field named `file` containing the `.csv` file.
**Response:** Same as `/api/import`.

### `GET /health`

Returns `{ "status": "ok", "timestamp": "..." }`

## Testing

The backend includes a comprehensive suite of unit tests for the chunker, the zero-shot prompt builder, and the validation logic (which enforces email/phone presence, normalises country codes, and escapes newlines).

```bash
cd backend
npm test
```

## Deployment

### Frontend (Vercel)
1. Push to GitHub.
2. Import the `frontend` folder into Vercel.
3. Vercel will auto-detect Next.js and build it.
4. Set `NEXT_PUBLIC_API_URL` to your hosted backend URL.

### Backend (Railway/Render)
1. Push to GitHub.
2. Deploy the `backend` folder as a Node.js web service.
3. Set Environment Variables:
   - `GEMINI_API_KEY`: Your Google AI key
   - `FRONTEND_URL`: Your hosted frontend URL (for CORS)

## Tech Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS v3, Papaparse
- **Backend:** Express, TypeScript, Google Gemini SDK (`@google/genai`), Multer, Vitest
- **Infra:** Docker, Docker Compose
