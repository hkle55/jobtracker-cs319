const form = document.getElementById("application-form");
const formError = document.getElementById("form-error");
const list = document.getElementById("application-list");
const emptyMessage = document.getElementById("empty-message");
const formHeading = document.getElementById("form-heading");
const submitButton = document.getElementById("submit-button");
const cancelEditButton = document.getElementById("cancel-edit");

// Functions such as readApplications (storage.js) and migrateApplications
// (applications.js) come from the scripts loaded before this one in index.html.

// Load saved applications and give any without a unique id one.
// The original data is backed up first so the migration can be undone.
const migration = migrateApplications(readApplications(localStorage), createId);
let applications = migration.applications;
if (migration.changed) {
  backupOriginalData(localStorage);
  saveApplications();
}

// id of the application being edited, or null when adding.
let editingId = null;

function saveApplications() {
  writeApplications(localStorage, applications);
}

function addLine(item, label, value) {
  const line = document.createElement("p");
  // textContent keeps user input from being interpreted as HTML.
  line.textContent = `${label}: ${value}`;
  item.appendChild(line);
}

function renderApplications() {
  list.replaceChildren();
  for (const application of applications) {
    const item = document.createElement("li");
    addLine(item, "Company", application.company);
    addLine(item, "Position", application.position);
    addLine(item, "Date applied", application.dateApplied);
    addLine(item, "Status", application.status);

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "secondary";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => startEditing(application.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => confirmAndDelete(application.id));

    const actions = document.createElement("div");
    actions.className = "item-actions";
    actions.append(editButton, deleteButton);
    item.appendChild(actions);

    list.appendChild(item);
  }
  emptyMessage.hidden = applications.length > 0;
}

// Fill the form with an existing application and switch to edit mode.
function startEditing(id) {
  const application = applications.find((a) => a.id === id);
  if (!application) return;
  editingId = id;
  form.elements.company.value = application.company;
  form.elements.position.value = application.position;
  form.elements.dateApplied.value = application.dateApplied;
  form.elements.status.value = application.status;
  formError.textContent = "";
  formHeading.textContent = "Edit job application";
  submitButton.textContent = "Save changes";
  cancelEditButton.hidden = false;
  form.elements.company.focus();
}

// Clear the form and switch back to adding new applications.
function stopEditing() {
  editingId = null;
  form.reset();
  formError.textContent = "";
  formHeading.textContent = "Add a job application";
  submitButton.textContent = "Add application";
  cancelEditButton.hidden = true;
}

function confirmAndDelete(id) {
  const application = applications.find((a) => a.id === id);
  if (!application) return;
  const confirmed = confirm(
    `Delete the ${application.position} application at ${application.company}?`
  );
  if (!confirmed) return;

  applications = deleteApplication(applications, id);

  // Deleting the application that is open in the form ends edit mode.
  // Other edits are unaffected because ids don't shift like positions do.
  if (editingId === id) stopEditing();

  saveApplications();
  renderApplications();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const application = {
    company: form.elements.company.value.trim(),
    position: form.elements.position.value.trim(),
    dateApplied: form.elements.dateApplied.value,
    status: form.elements.status.value,
  };

  const missing = findMissingFields(application);
  if (missing.length > 0) {
    formError.textContent = `Please enter: ${missing.join(", ")}.`;
    return;
  }

  if (editingId === null) {
    applications = addApplication(applications, application, createId);
  } else {
    // Replace the existing entry instead of adding a duplicate.
    applications = updateApplication(applications, editingId, application);
  }
  saveApplications();
  renderApplications();
  stopEditing();
});

cancelEditButton.addEventListener("click", stopEditing);

renderApplications();
