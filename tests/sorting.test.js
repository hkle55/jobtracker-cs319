import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";

// The app's scripts are plain browser scripts, so load them with require.
const require = createRequire(import.meta.url);
const { DEFAULT_SORT, isValidDate, sortApplications } = require("../sorting.js");
const { filterApplications } = require("../filters.js");
const { updateApplication, deleteApplication } = require("../applications.js");

// Builds fresh test data every time, saved in no particular order.
function makeApplications() {
  return [
    { id: "a", company: "Globex", position: "Developer", dateApplied: "2026-10-05", status: "Interviewing" },
    { id: "b", company: "acme", position: "Intern", dateApplied: "2026-11-10", status: "Applied" },
    { id: "c", company: "Initech", position: "QA Engineer", dateApplied: "2026-09-20", status: "Offer" },
    { id: "d", company: "Umbrella", position: "Analyst", dateApplied: "2026-11-01", status: "Applied" },
  ];
}

const idsOf = (list) => list.map((application) => application.id);

describe("sortApplications", () => {
  it("defaults to newest first", () => {
    expect(DEFAULT_SORT).toBe("newest");
    expect(idsOf(sortApplications(makeApplications()))).toEqual(["b", "d", "a", "c"]);
  });

  it("sorts newest first by date applied", () => {
    expect(idsOf(sortApplications(makeApplications(), "newest"))).toEqual(["b", "d", "a", "c"]);
  });

  it("sorts oldest first by date applied", () => {
    expect(idsOf(sortApplications(makeApplications(), "oldest"))).toEqual(["c", "a", "d", "b"]);
  });

  it("sorts by company A–Z", () => {
    expect(idsOf(sortApplications(makeApplications(), "company"))).toEqual(["b", "a", "c", "d"]);
  });

  it("ignores upper and lower case when sorting by company", () => {
    const list = [
      { id: "1", company: "beta", dateApplied: "2026-10-01" },
      { id: "2", company: "Alpha", dateApplied: "2026-10-01" },
      { id: "3", company: "ALPHA CORP", dateApplied: "2026-10-01" },
      { id: "4", company: "Beta Labs", dateApplied: "2026-10-01" },
    ];
    expect(idsOf(sortApplications(list, "company"))).toEqual(["2", "3", "1", "4"]);
  });

  it("falls back to newest first for an unknown option", () => {
    expect(idsOf(sortApplications(makeApplications(), "bogus"))).toEqual(["b", "d", "a", "c"]);
  });

  it("returns an empty list for an empty list", () => {
    for (const sortBy of ["newest", "oldest", "company"]) {
      expect(sortApplications([], sortBy)).toEqual([]);
    }
  });

  describe("ties keep their original relative order", () => {
    const sameDates = [
      { id: "1", company: "Zeta", dateApplied: "2026-10-01" },
      { id: "2", company: "Alpha", dateApplied: "2026-10-05" },
      { id: "3", company: "Mu", dateApplied: "2026-10-01" },
      { id: "4", company: "Beta", dateApplied: "2026-10-01" },
    ];

    it("for identical dates, newest first", () => {
      expect(idsOf(sortApplications(sameDates, "newest"))).toEqual(["2", "1", "3", "4"]);
    });

    it("for identical dates, oldest first", () => {
      expect(idsOf(sortApplications(sameDates, "oldest"))).toEqual(["1", "3", "4", "2"]);
    });

    it("for identical company names, including different case", () => {
      const sameCompany = [
        { id: "1", company: "Acme", dateApplied: "2026-10-09" },
        { id: "2", company: "Beta", dateApplied: "2026-10-01" },
        { id: "3", company: "ACME", dateApplied: "2026-10-01" },
        { id: "4", company: "acme", dateApplied: "2026-10-05" },
      ];
      expect(idsOf(sortApplications(sameCompany, "company"))).toEqual(["1", "3", "4", "2"]);
    });
  });

  describe("missing or invalid dates", () => {
    const list = [
      { id: "blank", company: "A", dateApplied: "" },
      { id: "old", company: "B", dateApplied: "2026-01-15" },
      { id: "missing", company: "C" },
      { id: "new", company: "D", dateApplied: "2026-12-01" },
      { id: "impossible", company: "E", dateApplied: "2026-02-30" },
      { id: "text", company: "F", dateApplied: "next week" },
    ];
    const invalidInOrder = ["blank", "missing", "impossible", "text"];

    it("go last, in their original order, when sorting newest first", () => {
      expect(idsOf(sortApplications(list, "newest"))).toEqual(["new", "old", ...invalidInOrder]);
    });

    it("go last, in their original order, when sorting oldest first", () => {
      expect(idsOf(sortApplications(list, "oldest"))).toEqual(["old", "new", ...invalidInOrder]);
    });

    it("do not stop company sorting from working", () => {
      expect(idsOf(sortApplications(list, "company"))).toEqual([
        "blank", "old", "missing", "new", "impossible", "text",
      ]);
    });

    it("do not crash when company is missing too", () => {
      const sparse = [{ id: "x" }, { id: "y", company: "Acme", dateApplied: "2026-10-01" }];
      expect(idsOf(sortApplications(sparse, "newest"))).toEqual(["y", "x"]);
      expect(idsOf(sortApplications(sparse, "company"))).toEqual(["x", "y"]);
    });
  });

  describe("never changes the saved applications", () => {
    it("leaves the original array's contents and order untouched", () => {
      const saved = makeApplications();
      for (const sortBy of ["newest", "oldest", "company"]) sortApplications(saved, sortBy);
      expect(saved).toEqual(makeApplications());
    });

    it("returns a new array", () => {
      const saved = makeApplications();
      const sorted = sortApplications(saved, "company");
      expect(sorted).not.toBe(saved);
      sorted.pop(); // changing the result must not affect the original
      expect(saved).toHaveLength(4);
    });

    it("returns the same application objects, unchanged", () => {
      const saved = makeApplications();
      const sorted = sortApplications(saved, "oldest");
      for (const application of sorted) {
        expect(saved).toContain(application); // same object, not a copy
      }
      expect(sorted.find((a) => a.id === "c")).toBe(saved[2]);
    });
  });
});

describe("isValidDate", () => {
  it("accepts real YYYY-MM-DD dates", () => {
    expect(isValidDate("2026-10-05")).toBe(true);
    expect(isValidDate("2028-02-29")).toBe(true); // leap year
  });

  it("rejects blanks, other formats, and impossible dates", () => {
    for (const value of ["", "2026-10-5", "10/05/2026", "2026-13-01", "2026-02-30", "2027-02-29", null, undefined, 20261005]) {
      expect(isValidDate(value)).toBe(false);
    }
  });
});

// The page filters first, then sorts the filtered result (see renderApplications).
describe("sorting together with filtering, editing, and deleting", () => {
  it("sorts only the filtered results", () => {
    const saved = makeApplications();
    const shown = sortApplications(filterApplications(saved, { status: "Applied" }), "oldest");
    expect(idsOf(shown)).toEqual(["d", "b"]);
  });

  it("sorts results that match a search", () => {
    const saved = makeApplications();
    // "a" matches acme, QA Engineer (Initech), and Umbrella/Analyst, but not Globex/Developer.
    const shown = sortApplications(filterApplications(saved, { query: "a" }), "oldest");
    expect(idsOf(shown)).toEqual(["c", "d", "b"]);
  });

  it("leaves the saved array untouched after filtering and then sorting", () => {
    const saved = makeApplications();
    sortApplications(filterApplications(saved, { query: "a", status: "Applied" }), "company");
    expect(saved).toEqual(makeApplications());
  });

  it("editing the first shown application updates that application by id", () => {
    const saved = makeApplications();
    const [first] = sortApplications(saved, "oldest"); // Initech, saved third
    const updated = updateApplication(saved, first.id, { ...first, status: "Rejected" });

    expect(updated.find((a) => a.id === "c").status).toBe("Rejected");
    expect(idsOf(updated)).toEqual(["a", "b", "c", "d"]); // saved order unchanged
    expect(updated.filter((a) => a.status === "Rejected")).toHaveLength(1);
  });

  it("deleting the first shown application removes that application by id", () => {
    const saved = makeApplications();
    const [first] = sortApplications(saved, "newest"); // acme, saved second
    expect(idsOf(deleteApplication(saved, first.id))).toEqual(["a", "c", "d"]);
  });
});
