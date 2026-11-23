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

// In the browser these functions are globals used by app.js.
// In Node (the Vitest tests) they are exported instead.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { findMissingFields };
}
