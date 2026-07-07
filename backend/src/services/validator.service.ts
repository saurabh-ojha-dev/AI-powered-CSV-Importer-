import type { CrmLead, SkippedRow } from "../types/crm.types.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /\d{7,15}/;

interface ValidationResult {
  valid: CrmLead[];
  skipped: SkippedRow[];
}

export function validateLeads(
  leads: CrmLead[],
  startIndex: number
): ValidationResult {
  const valid: CrmLead[] = [];
  const skipped: SkippedRow[] = [];

  for (let i = 0; i < leads.length; i++) {
    const lead = normalise(leads[i]);
    const hasEmail = EMAIL_RE.test(lead.email);
    const hasPhone = PHONE_RE.test(lead.mobile_without_country_code);

    if (!hasEmail || !hasPhone) {
      skipped.push({
        originalIndex: startIndex + i,
        row: lead as unknown as Record<string, string>,
        reason: "Missing a valid email or a valid mobile number",
      });
      continue;
    }

    valid.push(lead);
  }

  return { valid, skipped };
}

function normalise(lead: CrmLead): CrmLead {
  const cleaned = { ...lead };

  for (const key of Object.keys(cleaned) as (keyof CrmLead)[]) {
    if (typeof cleaned[key] === "string") {
      (cleaned as Record<string, string>)[key] = cleaned[key].trim();
    }
  }

  // strip non-digit chars from the phone field
  cleaned.mobile_without_country_code =
    cleaned.mobile_without_country_code.replace(/[^\d]/g, "");

  // normalise country_code: keep digits, prepend + if missing
  const digits = cleaned.country_code.replace(/[^\d]/g, "");
  cleaned.country_code = digits ? `+${digits}` : "";

  // sanitise any stray newlines inside field values so CSV output stays valid
  for (const key of Object.keys(cleaned) as (keyof CrmLead)[]) {
    if (typeof cleaned[key] === "string") {
      (cleaned as Record<string, string>)[key] = (cleaned[key] as string).replace(/\r?\n/g, "\\n");
    }
  }

  return cleaned;
}
