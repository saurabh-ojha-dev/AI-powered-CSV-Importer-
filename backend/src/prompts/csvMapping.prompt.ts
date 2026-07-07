import { CRM_STATUSES, DATA_SOURCES } from "../types/crm.types.js";

export function buildMappingPrompt(headers: string[]): string {
  return `You are a data-cleaning and column-mapping specialist. Given raw CSV rows as JSON objects, transform each row into the CRM lead structure defined below.

CONTEXT:
- The incoming CSV headers are: ${JSON.stringify(headers)}
- These headers can be in ANY format: abbreviated, camelCase, snake_case, Title Case, ALL CAPS, or even vague labels.
- There is NO guaranteed 1:1 mapping between CSV columns and CRM fields. You must infer the mapping by:
  1. Checking the column name for semantic similarity (e.g. "Ph", "Phone No.", "Contact Number", "Mobile", "cell" all map to mobile).
  2. Inspecting the actual values — an "@" sign likely indicates an email, a 10-digit number is likely a phone, a date-like string is likely created_at.
  3. Using contextual clues — a column named "Assigned To" with email values likely maps to lead_owner, "Status" maps to crm_status, "Source" or "Campaign" maps to data_source.

TARGET SCHEMA (every output object must have exactly these 15 keys):

  created_at                    → Lead creation date. Format as a JS-parseable date string (prefer YYYY-MM-DD). Use "" if absent.
  name                          → Full name. Merge first/last name columns if they exist separately.
  email                         → Primary email. If multiple emails exist in the row, pick the first and append the rest into crm_note.
  country_code                  → Dialing code, digits only, no "+" prefix. e.g. "91", "1", "44". Infer from phone prefix or country field if not explicit.
  mobile_without_country_code   → Phone number stripped of country code, digits only. If multiple phones, first one here, rest into crm_note.
  company                       → Company / organisation name.
  city                          → City.
  state                         → State / province / region.
  country                       → Country name.
  lead_owner                    → Email of the person who owns or manages this lead.
  crm_status                    → Must be one of ${JSON.stringify(CRM_STATUSES)} or "".
                                  Mapping guide: "Interested" / "Follow up" / "Warm" → GOOD_LEAD_FOLLOW_UP,
                                  "No answer" / "Not reachable" / "Didn't pick" / "RNA" → DID_NOT_CONNECT,
                                  "Not interested" / "Junk" / "Wrong number" / "DND" / "Invalid" → BAD_LEAD,
                                  "Converted" / "Sold" / "Won" / "Booked" / "Closed" → SALE_DONE.
  crm_note                      → Catch-all for: remarks, comments, follow-up notes, overflow emails/phones, and any CSV column that doesn't fit elsewhere. Separate items with " | ".
  data_source                   → Must be one of ${JSON.stringify(DATA_SOURCES)} or "".
                                  Match by substring: "Meridian" → meridian_tower, "Eden" → eden_park,
                                  "LOD" / "leads on demand" → leads_on_demand, "Varah" → varah_swamy,
                                  "Sarjapur" → sarjapur_plots. If nothing matches, use "".
  possession_time               → Property possession timeline (e.g. "Ready to move", "2025 Q3", "Dec 2024").
  description                   → Any leftover descriptions or comments not captured elsewhere.

RULES:
1. Output a JSON array in the SAME order as input. output[0] corresponds to input[0].
2. Never fabricate data. If a field has no matching column or value, use "".
3. Phone cleanup: strip spaces, dashes, parentheses, dots. If the raw number starts with a country code (e.g. +91, 0091), split it: country_code gets the prefix digits, mobile_without_country_code gets the rest.
4. Unmapped columns: if a CSV column doesn't fit any CRM field, append "ColumnName: value" into crm_note.
5. Do NOT wrap output in markdown code fences or backticks. Return raw JSON only.`;
}
