const form = document.getElementById("application-form");
const formError = document.getElementById("form-error");
const list = document.getElementById("application-list");
const emptyMessage = document.getElementById("empty-message");
const formHeading = document.getElementById("form-heading");
const submitButton = document.getElementById("submit-button");
const cancelEditButton = document.getElementById("cancel-edit");

const STORAGE_KEY = "jobtracker.applications";

const applications = loadApplications();

// Position in `applications` of the one being edited, or null when adding.
let editingIndex = null;

function loadApplications() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    // Saved data that isn't valid JSON is treated as an empty list.
    return [];
  }
}

function saveApplications() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

// Returns the label of every required field that is blank.
function findMissingFields(application) {
  const missing = [];
  if (application.company === "") missing.push("company name");
  if (application.position === "") missing.push("position");
  if (application.dateApplied === "") missing.push("date applied");
  if (application.status === "") missing.push("status");
  return missing;
}

function addLine(item, label, value) {
  const line = document.createElement("p");
  // textContent keeps user input from being interpreted as HTML.
  line.textContent = `${label}: ${value}`;
  item.appendChild(line);
}

function renderApplications() {
  list.replaceChildren();
  applications.forEach((application, index) => {
    const item = document.createElement("li");
    addLine(item, "Company", application.company);
    addLine(item, "Position", application.position);
    addLine(item, "Date applied", application.dateApplied);
    addLine(item, "Status", application.status);

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "secondary";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => startEditing(index));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteApplication(index));

    const actions = document.createElement("div");
    actions.className = "item-actions";
    actions.append(editButton, deleteButton);
    item.appendChild(actions);

    list.appendChild(item);
  });
  emptyMessage.hidden = applications.length > 0;
}

// Fill the form with an existing application and switch to edit mode.
function startEditing(index) {
  const application = applications[index];
  editingIndex = index;
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
  editingIndex = null;
  form.reset();
  formError.textContent = "";
  formHeading.textContent = "Add a job application";
  submitButton.textContent = "Add application";
  cancelEditButton.hidden = true;
}

function deleteApplication(index) {
  const application = applications[index];
  const confirmed = confirm(
    `Delete the ${application.position} application at ${application.company}?`
  );
  if (!confirmed) return;

  applications.splice(index, 1);

  // Keep edit mode pointing at the right application after the removal.
  if (editingIndex === index) {
    stopEditing();
  } else if (editingIndex !== null && editingIndex > index) {
    editingIndex -= 1;
  }

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

  if (editingIndex === null) {
    applications.push(application);
  } else {
    // Replace the existing entry instead of adding a duplicate.
    applications[editingIndex] = application;
  }
  saveApplications();
  renderApplications();
  stopEditing();
});

cancelEditButton.addEventListener("click", stopEditing);

renderApplications();
