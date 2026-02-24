const DATA_URL = "../data/mini-gardens.json";
const STORAGE_KEY = "sf-mini-gardens-submission-drafts";

const entriesList = document.getElementById("entries");
const mapFrame = document.getElementById("map-frame");
const mapStatus = document.getElementById("map-status");
const submissionForm = document.getElementById("submission-form");
const submissionStatus = document.getElementById("submission-status");
const submissionPreview = document.getElementById("submission-preview");

function mapEmbedUrl(lat, lng) {
  const delta = 0.0035;
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
}

function entryToListItem(entry) {
  const segment = `${entry.street_segment.street_name}, ${entry.street_segment.from_street} to ${entry.street_segment.to_street}`;
  return `
    <li>
      <strong>${entry.name}</strong>
      <span>${segment}</span><br />
      <span>${entry.neighborhood}, ${entry.city}</span><br />
      <span>Status: ${entry.status}</span>
      <p>${entry.description}</p>
    </li>
  `;
}

function buildDraftSubmission(formData) {
  return {
    id: `draft-${Date.now()}`,
    status: "pending_review",
    city: "San Francisco",
    state: "CA",
    name: formData.get("name"),
    street_segment: {
      street_name: formData.get("streetName"),
      from_street: formData.get("fromStreet"),
      to_street: formData.get("toStreet")
    },
    description: formData.get("description"),
    created_on: new Date().toISOString(),
    source: "community-form-draft"
  };
}

function loadDrafts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDraft(draft) {
  const drafts = loadDrafts();
  drafts.unshift(draft);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

async function loadEntries() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load data (${response.status})`);
  }
  const payload = await response.json();
  return payload.entries || [];
}

async function init() {
  try {
    const entries = await loadEntries();
    if (entries.length === 0) {
      mapStatus.textContent = "No entries available yet.";
      entriesList.innerHTML = "<li>No verified entries.</li>";
      return;
    }

    entriesList.innerHTML = entries.map(entryToListItem).join("");
    const focus = entries[0];
    mapFrame.src = mapEmbedUrl(focus.coordinates.lat, focus.coordinates.lng);
    mapStatus.textContent = `Showing ${focus.street_segment.street_name} pilot entry.`;
  } catch (error) {
    mapStatus.textContent = `Unable to load map data: ${error.message}`;
    entriesList.innerHTML = "<li>Data failed to load.</li>";
  }
}

submissionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const draft = buildDraftSubmission(new FormData(submissionForm));
  saveDraft(draft);
  submissionPreview.textContent = JSON.stringify(draft, null, 2);
  submissionStatus.textContent = "Draft saved locally. Next step: moderation review and geocode verification.";
  submissionForm.reset();
});

init();
