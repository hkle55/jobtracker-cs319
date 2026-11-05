const form = document.getElementById("application-form");
const formError = document.getElementById("form-error");
const list = document.getElementById("application-list");
const emptyMessage = document.getElementById("empty-message");

const applications = [];

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
  for (const application of applications) {
    const item = document.createElement("li");
    addLine(item, "Company", application.company);
    addLine(item, "Position", application.position);
    addLine(item, "Date applied", application.dateApplied);
    addLine(item, "Status", application.status);
    list.appendChild(item);
  }
  emptyMessage.hidden = applications.length > 0;
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

  formError.textContent = "";
  applications.push(application);
  renderApplications();
  form.reset();
});

renderApplications();
