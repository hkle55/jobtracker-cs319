// Decides which saved applications are shown on screen. These functions only
// read applications: they never change, reorder, or remove saved data.

// True when the search text appears in the company or position, ignoring
// upper/lower case and spaces around the search. An empty search matches all.
function matchesSearch(application, { query = "" }) {
  const search = query.trim().toLowerCase();
  if (search === "") return true;

  const company = String(application.company ?? "").toLowerCase();
  const position = String(application.position ?? "").toLowerCase();
  return company.includes(search) || position.includes(search);
}

// True when the application has the chosen status. "" means all statuses.
function matchesStatus(application, { status = "" }) {
  return status === "" || application.status === status;
}

// Every filter an application must pass to be shown. To add a new kind of
// filter, write another function like the two above and add it here;
// filterApplications itself does not need to change.
const FILTERS = [matchesSearch, matchesStatus];

// Returns a NEW array of the applications that pass every filter, in their
// original order. The `applications` array passed in is never modified.
function filterApplications(applications, criteria = {}) {
  return applications.filter((application) =>
    FILTERS.every((filter) => filter(application, criteria))
  );
}

// In the browser these functions are globals used by app.js.
// In Node (the Vitest tests) they are exported instead.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { matchesSearch, matchesStatus, filterApplications };
}
