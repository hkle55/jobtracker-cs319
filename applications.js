// Data rules for job applications. No DOM or localStorage code belongs here,
// so these functions can be tested on their own.

// Returns the label of every required field that is blank.
function findMissingFields(application) {
  const missing = [];
  if (application.company === "") missing.push("company name");
  if (application.position === "") missing.push("position");
  if (application.dateApplied === "") missing.push("date applied");
  if (application.status === "") missing.push("status");
  return missing;
}

// Returns a new unique ID string.
function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for browsers without crypto.randomUUID.
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Gives every saved application a unique `id`, keeping all its other fields.
// Records from Sprint 1 have no id; a blank or repeated id is also replaced.
// `generateId` is passed in so tests can supply predictable IDs.
// Returns the new list and whether anything had to change.
function migrateApplications(records, generateId) {
  const usedIds = new Set();
  let changed = false;

  const applications = records.map((record) => {
    // Leave anything that isn't an application object exactly as it was.
    if (record === null || typeof record !== "object") return record;

    const hasUsableId =
      typeof record.id === "string" && record.id.trim() !== "" && !usedIds.has(record.id);
    if (hasUsableId) {
      usedIds.add(record.id);
      return record;
    }

    changed = true;
    let id = generateId();
    while (usedIds.has(id)) id = generateId(); // never hand out an ID twice
    usedIds.add(id);
    return { ...record, id };
  });

  return { applications, changed };
}

// Each function below returns a new list and leaves the original unchanged.

function addApplication(applications, fields, generateId) {
  return [...applications, { id: generateId(), ...fields }];
}

// Replaces the fields of the application with this id. Its id never changes.
function updateApplication(applications, id, fields) {
  return applications.map((application) =>
    application.id === id ? { ...application, ...fields, id } : application
  );
}

function deleteApplication(applications, id) {
  return applications.filter((application) => application.id !== id);
}

// In the browser these functions are globals used by app.js.
// In Node (the Vitest tests) they are exported instead.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    findMissingFields,
    createId,
    migrateApplications,
    addApplication,
    updateApplication,
    deleteApplication,
  };
}
