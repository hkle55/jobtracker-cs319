import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";

// filters.js is a plain browser script, so load it with require.
const require = createRequire(import.meta.url);
const { matchesSearch, matchesStatus, filterApplications } = require("../filters.js");

// Builds a fresh copy of the test data every time it is called.
function makeApplications() {
  return [
    { id: "a", company: "Acme", position: "Software Intern", dateApplied: "2026-10-01", status: "Applied" },
    { id: "b", company: "Globex", position: "Frontend Developer", dateApplied: "2026-10-05", status: "Interviewing" },
    { id: "c", company: "Initech", position: "QA Engineer", dateApplied: "2026-11-01", status: "Offer" },
    { id: "d", company: "Acme Labs", position: "Data Analyst", dateApplied: "2026-11-10", status: "Rejected" },
  ];
}

const applications = makeApplications();

const idsOf = (list) => list.map((application) => application.id);

describe("matchesSearch", () => {
  it("matches the company name", () => {
    expect(matchesSearch(applications[1], { query: "Globex" })).toBe(true);
  });

  it("matches the position", () => {
    expect(matchesSearch(applications[1], { query: "Developer" })).toBe(true);
  });

  it("ignores upper and lower case", () => {
    expect(matchesSearch(applications[1], { query: "gLoBeX" })).toBe(true);
    expect(matchesSearch(applications[1], { query: "FRONTEND" })).toBe(true);
  });

  it("matches part of a word", () => {
    expect(matchesSearch(applications[2], { query: "nite" })).toBe(true);
  });

  it("ignores spaces around the search", () => {
    expect(matchesSearch(applications[0], { query: "  acme  " })).toBe(true);
  });

  it("does not match other fields such as status", () => {
    expect(matchesSearch(applications[0], { query: "Applied" })).toBe(false);
  });

  it("matches everything when the search is empty or only spaces", () => {
    expect(matchesSearch(applications[0], { query: "" })).toBe(true);
    expect(matchesSearch(applications[0], { query: "   " })).toBe(true);
    expect(matchesSearch(applications[0], {})).toBe(true);
  });

  it("does not crash on an application with missing fields", () => {
    expect(matchesSearch({ id: "x" }, { query: "acme" })).toBe(false);
  });
});

describe("matchesStatus", () => {
  it("matches only the chosen status", () => {
    expect(matchesStatus(applications[2], { status: "Offer" })).toBe(true);
    expect(matchesStatus(applications[2], { status: "Applied" })).toBe(false);
  });

  it("matches every status when 'All statuses' (empty) is chosen", () => {
    for (const application of applications) {
      expect(matchesStatus(application, { status: "" })).toBe(true);
      expect(matchesStatus(application, {})).toBe(true);
    }
  });
});

describe("filterApplications", () => {
  it("returns every application when no search or status is set", () => {
    expect(idsOf(filterApplications(applications, { query: "", status: "" }))).toEqual(["a", "b", "c", "d"]);
    expect(idsOf(filterApplications(applications))).toEqual(["a", "b", "c", "d"]);
  });

  it("filters by search alone", () => {
    expect(idsOf(filterApplications(applications, { query: "acme" }))).toEqual(["a", "d"]);
  });

  it("filters by status alone", () => {
    expect(idsOf(filterApplications(applications, { status: "Interviewing" }))).toEqual(["b"]);
  });

  it("combines search and status: an application must match both", () => {
    expect(idsOf(filterApplications(applications, { query: "acme", status: "Rejected" }))).toEqual(["d"]);
    expect(idsOf(filterApplications(applications, { query: "acme", status: "Offer" }))).toEqual([]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterApplications(applications, { query: "no such company" })).toEqual([]);
  });

  it("keeps the original order", () => {
    const reversed = [...applications].reverse();
    expect(idsOf(filterApplications(reversed, { query: "acme" }))).toEqual(["d", "a"]);
  });

  // These tests build their own fresh data, so a mutation can't be hidden
  // by (or leak into) the shared `applications` used above.
  describe("never changes the saved applications", () => {
    it("leaves the original array's contents and order untouched", () => {
      const saved = makeApplications();
      filterApplications(saved, { query: "acme", status: "Rejected" });
      filterApplications(saved, { query: "zzz" });
      expect(saved).toEqual(makeApplications());
    });

    it("returns a new array, even when everything matches", () => {
      const saved = makeApplications();
      const result = filterApplications(saved, {});
      expect(result).not.toBe(saved);
      result.pop(); // changing the result must not affect the original
      expect(saved).toHaveLength(4);
    });

    it("returns the same application objects, so ids still point at saved data", () => {
      const saved = makeApplications();
      const [shown] = filterApplications(saved, { query: "Globex" });
      expect(shown).toBe(saved[1]);
    });
  });
});
