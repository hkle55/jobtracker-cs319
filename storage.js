// Reading and writing saved applications. `storage` is any object with
// getItem/setItem: the browser passes localStorage, tests pass a fake.

const STORAGE_KEY = "jobtracker.applications";

function readApplications(storage) {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    // Saved data that isn't valid JSON is treated as an empty list.
    return [];
  }
}

function writeApplications(storage, applications) {
  storage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

// In the browser these are globals used by app.js.
// In Node (the Vitest tests) they are exported instead.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { STORAGE_KEY, readApplications, writeApplications };
}
