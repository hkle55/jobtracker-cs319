// Decides the order applications are shown in. These functions only read
// applications: they never change or reorder the saved list.

const DEFAULT_SORT = "newest";

// True for a real calendar date written as YYYY-MM-DD, the format the
// date input saves. Rejects blanks, other formats, and impossible dates
// such as 2026-02-30 (which Date.parse would quietly turn into March 2).
function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Builds a comparison for dateApplied. Valid YYYY-MM-DD dates compare
// correctly as text. Missing or invalid dates always go last.
function compareDates(direction) {
  return (a, b) => {
    const aValid = isValidDate(a.dateApplied);
    const bValid = isValidDate(b.dateApplied);
    if (!aValid || !bValid) return Number(!aValid) - Number(!bValid);
    if (a.dateApplied === b.dateApplied) return 0;
    const ascending = a.dateApplied < b.dateApplied ? -1 : 1;
    return direction === "asc" ? ascending : -ascending;
  };
}

// Company A–Z, ignoring upper/lower case.
function compareCompanies(a, b) {
  return String(a.company ?? "").localeCompare(String(b.company ?? ""), undefined, {
    sensitivity: "base",
  });
}

// The sort options offered in the dropdown, by value.
const SORT_COMPARATORS = {
  newest: compareDates("desc"),
  oldest: compareDates("asc"),
  company: compareCompanies,
};

// Returns a NEW array in the chosen order ("newest", "oldest", or "company";
// anything else falls back to newest). The array passed in is copied first
// because Array.sort reorders the array it is called on. Applications that
// tie keep their original relative order, because Array.sort is stable.
function sortApplications(applications, sortBy = DEFAULT_SORT) {
  const compare = SORT_COMPARATORS[sortBy] ?? SORT_COMPARATORS[DEFAULT_SORT];
  return [...applications].sort(compare);
}

// In the browser these functions are globals used by app.js.
// In Node (the Vitest tests) they are exported instead.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DEFAULT_SORT, isValidDate, sortApplications };
}
