/* ─── CRM Enums ─── */

export const CRM_STATUSES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;

export const DATA_SOURCES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
] as const;

export type CrmStatus = (typeof CRM_STATUSES)[number];
export type DataSource = (typeof DATA_SOURCES)[number];

/* ─── CRM Lead Shape ─── */

export interface CrmLead {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: CrmStatus | "";
  crm_note: string;
  data_source: DataSource | "";
  possession_time: string;
  description: string;
}

/* ─── API DTOs ─── */

export interface ImportRequest {
  rows: Record<string, string>[];
  headers: string[];
}

export interface SkippedRow {
  originalIndex: number;
  row: Record<string, string>;
  reason: string;
}

export interface ImportResponse {
  imported: CrmLead[];
  skipped: SkippedRow[];
  stats: {
    total: number;
    imported: number;
    skipped: number;
  };
}
