import { describe, it, expect } from "vitest";
import { buildMappingPrompt } from "../prompts/csvMapping.prompt.js";

describe("buildMappingPrompt", () => {
  it("includes the provided headers in the prompt", () => {
    const headers = ["Name", "Email", "Phone"];
    const prompt = buildMappingPrompt(headers);

    expect(prompt).toContain(JSON.stringify(headers));
  });

  it("includes all 15 CRM field names", () => {
    const prompt = buildMappingPrompt(["col1"]);
    const requiredFields = [
      "created_at",
      "name",
      "email",
      "country_code",
      "mobile_without_country_code",
      "company",
      "city",
      "state",
      "country",
      "lead_owner",
      "crm_status",
      "crm_note",
      "data_source",
      "possession_time",
      "description",
    ];

    for (const field of requiredFields) {
      expect(prompt).toContain(field);
    }
  });

  it("includes allowed CRM status values", () => {
    const prompt = buildMappingPrompt(["col1"]);

    expect(prompt).toContain("GOOD_LEAD_FOLLOW_UP");
    expect(prompt).toContain("DID_NOT_CONNECT");
    expect(prompt).toContain("BAD_LEAD");
    expect(prompt).toContain("SALE_DONE");
  });

  it("includes allowed data source values", () => {
    const prompt = buildMappingPrompt(["col1"]);

    expect(prompt).toContain("leads_on_demand");
    expect(prompt).toContain("meridian_tower");
    expect(prompt).toContain("eden_park");
    expect(prompt).toContain("varah_swamy");
    expect(prompt).toContain("sarjapur_plots");
  });

  it("instructs to preserve row order", () => {
    const prompt = buildMappingPrompt(["col1"]);

    expect(prompt).toContain("SAME order");
  });

  it("instructs not to wrap in markdown fences", () => {
    const prompt = buildMappingPrompt(["col1"]);

    expect(prompt.toLowerCase()).toContain("do not wrap");
  });
});
