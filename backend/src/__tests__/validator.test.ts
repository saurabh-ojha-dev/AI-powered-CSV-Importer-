import { describe, it, expect } from "vitest";
import { validateLeads } from "../services/validator.service.js";
import type { CrmLead } from "../types/crm.types.js";

function makeLead(overrides: Partial<CrmLead> = {}): CrmLead {
  return {
    created_at: "",
    name: "",
    email: "",
    country_code: "",
    mobile_without_country_code: "",
    company: "",
    city: "",
    state: "",
    country: "",
    lead_owner: "",
    crm_status: "",
    crm_note: "",
    data_source: "",
    possession_time: "",
    description: "",
    ...overrides,
  };
}

describe("validateLeads", () => {
  it("skips a lead with missing phone", () => {
    const lead = makeLead({ email: "john@example.com" });
    const { valid, skipped } = validateLeads([lead], 0);

    expect(valid.length).toBe(0);
    expect(skipped.length).toBe(1);
    expect(skipped[0].reason).toContain("Missing a valid email or a valid mobile number");
  });

  it("skips a lead with missing email", () => {
    const lead = makeLead({ mobile_without_country_code: "9876543210" });
    const { valid, skipped } = validateLeads([lead], 0);

    expect(valid.length).toBe(0);
    expect(skipped.length).toBe(1);
    expect(skipped[0].reason).toContain("Missing a valid email or a valid mobile number");
  });

  it("passes a lead with both email and phone", () => {
    const lead = makeLead({ email: "test@test.com", mobile_without_country_code: "9876543210" });
    const { valid, skipped } = validateLeads([lead], 0);

    expect(valid.length).toBe(1);
    expect(skipped.length).toBe(0);
  });

  it("normalises country_code to include + prefix", () => {
    const lead = makeLead({
      email: "test@test.com",
      mobile_without_country_code: "9876543210",
      country_code: "91",
    });
    const { valid } = validateLeads([lead], 0);

    expect(valid[0].country_code).toBe("+91");
  });

  it("handles country_code already having + prefix", () => {
    const lead = makeLead({
      email: "test@test.com",
      mobile_without_country_code: "9876543210",
      country_code: "+91",
    });
    const { valid } = validateLeads([lead], 0);

    expect(valid[0].country_code).toBe("+91");
  });

  it("strips non-digit chars from phone numbers", () => {
    const lead = makeLead({
      email: "test@test.com",
      mobile_without_country_code: "(987) 654-3210",
    });
    const { valid } = validateLeads([lead], 0);

    expect(valid[0].mobile_without_country_code).toBe("9876543210");
  });

  it("escapes newlines in field values", () => {
    const lead = makeLead({
      email: "test@test.com",
      mobile_without_country_code: "9876543210",
      crm_note: "Line one\nLine two\r\nLine three",
    });
    const { valid } = validateLeads([lead], 0);

    expect(valid[0].crm_note).toBe("Line one\\nLine two\\nLine three");
  });

  it("trims whitespace from all fields", () => {
    const lead = makeLead({
      email: "  test@test.com  ",
      mobile_without_country_code: "  9876543210  ",
      name: "  John Doe  ",
    });
    const { valid } = validateLeads([lead], 0);

    expect(valid[0].email).toBe("test@test.com");
    expect(valid[0].mobile_without_country_code).toBe("9876543210");
    expect(valid[0].name).toBe("John Doe");
  });

  it("preserves original index for skipped rows", () => {
    const leads = [
      makeLead({ email: "a@b.com", mobile_without_country_code: "1234567890" }), // valid
      makeLead({}), // skipped
      makeLead({ email: "c@d.com", mobile_without_country_code: "0987654321" }), // valid
    ];
    const { skipped } = validateLeads(leads, 10);

    expect(skipped[0].originalIndex).toBe(11);
  });
});
