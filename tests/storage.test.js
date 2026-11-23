import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  STORAGE_KEY,
  BACKUP_KEY,
  readApplications,
  writeApplications,
  backupOriginalData,
} = require("../storage.js");

// Stands in for the browser's localStorage, which Node doesn't have.
function createFakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

const sample = {
  company: "Acme",
  position: "Intern",
  dateApplied: "2026-10-01",
  status: "Applied",
};

describe("readApplications", () => {
  it("returns an empty list when nothing has been saved", () => {
    expect(readApplications(createFakeStorage())).toEqual([]);
  });

  it("returns an empty list when the saved data is not valid JSON", () => {
    const storage = createFakeStorage({ [STORAGE_KEY]: "{not json" });
    expect(readApplications(storage)).toEqual([]);
  });

  it("returns an empty list when the saved data is not a list", () => {
    const storage = createFakeStorage({ [STORAGE_KEY]: '{"company":"Acme"}' });
    expect(readApplications(storage)).toEqual([]);
  });
});

describe("writeApplications", () => {
  it("saves a list that readApplications reads back unchanged", () => {
    const storage = createFakeStorage();
    writeApplications(storage, [sample]);
    expect(readApplications(storage)).toEqual([sample]);
  });

  it("uses the same key as Sprint 1 so existing data still loads", () => {
    expect(STORAGE_KEY).toBe("jobtracker.applications");
  });
});

describe("backupOriginalData", () => {
  it("copies the saved data exactly as stored", () => {
    const original = JSON.stringify([sample]);
    const storage = createFakeStorage({ [STORAGE_KEY]: original });

    backupOriginalData(storage);

    expect(storage.getItem(BACKUP_KEY)).toBe(original);
  });

  it("never replaces an existing backup", () => {
    const storage = createFakeStorage({ [STORAGE_KEY]: "first" });
    backupOriginalData(storage);
    storage.setItem(STORAGE_KEY, "second");
    backupOriginalData(storage);

    expect(storage.getItem(BACKUP_KEY)).toBe("first");
  });

  it("does nothing when there is no saved data", () => {
    const storage = createFakeStorage();
    backupOriginalData(storage);
    expect(storage.getItem(BACKUP_KEY)).toBeNull();
  });
});
