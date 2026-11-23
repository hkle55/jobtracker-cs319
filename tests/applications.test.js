import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";

// applications.js is a plain browser script, so load it with require.
const require = createRequire(import.meta.url);
const { findMissingFields } = require("../applications.js");

const complete = {
  company: "Acme",
  position: "Intern",
  dateApplied: "2026-10-01",
  status: "Applied",
};

describe("findMissingFields", () => {
  it("returns nothing when every field is filled in", () => {
    expect(findMissingFields(complete)).toEqual([]);
  });

  it("names each blank field in form order", () => {
    const blank = { company: "", position: "", dateApplied: "", status: "" };
    expect(findMissingFields(blank)).toEqual([
      "company name",
      "position",
      "date applied",
      "status",
    ]);
  });

  it("only names the fields that are blank", () => {
    expect(findMissingFields({ ...complete, position: "" })).toEqual(["position"]);
  });
});
