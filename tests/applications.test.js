import { describe, it, expect, vi, afterEach } from "vitest";
import { createRequire } from "node:module";

// applications.js is a plain browser script, so load it with require.
const require = createRequire(import.meta.url);
const {
  findMissingFields,
  createId,
  migrateApplications,
  addApplication,
  updateApplication,
  deleteApplication,
} = require("../applications.js");

// Returns "id-1", "id-2", ... so tests know exactly which IDs to expect.
function sequentialIds() {
  let next = 1;
  return () => `id-${next++}`;
}

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

describe("createId", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns a non-empty string", () => {
    const id = createId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("does not repeat across 1000 calls", () => {
    const ids = new Set(Array.from({ length: 1000 }, createId));
    expect(ids.size).toBe(1000);
  });

  it("still makes unique IDs when crypto.randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", undefined);
    const ids = new Set(Array.from({ length: 1000 }, createId));
    expect(ids.size).toBe(1000);
  });
});

describe("migrateApplications", () => {
  it("adds an id to Sprint 1 records and keeps every other field", () => {
    const sprint1 = [complete, { ...complete, company: "Globex" }];
    const { applications, changed } = migrateApplications(sprint1, sequentialIds());

    expect(changed).toBe(true);
    expect(applications).toEqual([
      { ...complete, id: "id-1" },
      { ...complete, company: "Globex", id: "id-2" },
    ]);
  });

  it("keeps existing ids and reports no change when all are valid", () => {
    const saved = [{ ...complete, id: "a" }, { ...complete, id: "b" }];
    const { applications, changed } = migrateApplications(saved, sequentialIds());

    expect(changed).toBe(false);
    expect(applications).toEqual(saved);
  });

  it("replaces a repeated id so every application is unique", () => {
    const saved = [{ ...complete, id: "a" }, { ...complete, company: "Globex", id: "a" }];
    const { applications } = migrateApplications(saved, sequentialIds());

    expect(applications.map((a) => a.id)).toEqual(["a", "id-1"]);
    expect(applications[1].company).toBe("Globex");
  });

  it("replaces blank and non-string ids", () => {
    const saved = [{ ...complete, id: "  " }, { ...complete, id: 42 }];
    const { applications } = migrateApplications(saved, sequentialIds());
    expect(applications.map((a) => a.id)).toEqual(["id-1", "id-2"]);
  });

  it("never hands out an id that is already in use", () => {
    // The generator's first answer clashes with a saved id, so it must try again.
    const saved = [{ ...complete, id: "id-1" }, complete];
    const { applications } = migrateApplications(saved, sequentialIds());
    expect(applications.map((a) => a.id)).toEqual(["id-1", "id-2"]);
  });

  it("does not change the list it was given", () => {
    const saved = [{ ...complete }];
    migrateApplications(saved, sequentialIds());
    expect(saved).toEqual([complete]);
  });

  it("handles an empty list", () => {
    expect(migrateApplications([], sequentialIds())).toEqual({ applications: [], changed: false });
  });
});

describe("addApplication", () => {
  it("adds the application with a new id at the end", () => {
    const existing = [{ ...complete, id: "a" }];
    const result = addApplication(existing, { ...complete, company: "Globex" }, sequentialIds());

    expect(result).toEqual([existing[0], { id: "id-1", ...complete, company: "Globex" }]);
    expect(existing).toHaveLength(1); // original list untouched
  });
});

describe("updateApplication", () => {
  const list = [
    { ...complete, id: "a" },
    { ...complete, company: "Globex", id: "b" },
  ];

  it("changes only the application with that id and keeps its id", () => {
    const result = updateApplication(list, "b", { ...complete, status: "Offer" });

    expect(result[0]).toEqual(list[0]);
    expect(result[1]).toEqual({ ...complete, status: "Offer", id: "b" });
    expect(result).toHaveLength(2); // no duplicate added
  });

  it("ignores an id inside the new fields", () => {
    const result = updateApplication(list, "a", { ...complete, id: "hacked" });
    expect(result[0].id).toBe("a");
  });

  it("changes nothing for an unknown id", () => {
    expect(updateApplication(list, "missing", complete)).toEqual(list);
  });
});

describe("deleteApplication", () => {
  const list = [
    { ...complete, id: "a" },
    { ...complete, id: "b" },
    { ...complete, id: "c" },
  ];

  it("removes only the application with that id", () => {
    expect(deleteApplication(list, "b").map((a) => a.id)).toEqual(["a", "c"]);
    expect(list).toHaveLength(3); // original list untouched
  });

  it("changes nothing for an unknown id", () => {
    expect(deleteApplication(list, "missing")).toEqual(list);
  });
});
