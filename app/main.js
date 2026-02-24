import {
  DRAFT_QUEUE_STATUSES,
  buildDraftSubmission,
  hasDuplicateSubmission,
  updateDraftQueueStatus
} from "../lib/submissionDraft.mjs";

const DATA_URL = "../data/mini-gardens.json";
const STORAGE_KEY = "sf-mini-gardens-submission-drafts";

const entriesList = document.getElementById("entries");
const mapFrame = document.getElementById("map-frame");
const mapStatus = document.getElementById("map-status");
const submissionForm = document.getElementById("submission-form");
const submissionStatus = document.getElementById("submission-status");
const submissionPreview = document.getElementById("submission-preview");
const draftList = document.getElementById("draft-list");
const draftCount = document.getElementById("draft-count");
const downloadDraftsBtn = document.getElementById("download-drafts");
const clearDraftsBtn = document.getElementById("clear-drafts");

const statusLabel = {
  queued: "Queued",
  needs_clarification: "Needs clarification",
  ready_for_geocode: "Ready for geocode",
  verified: "Verified",
  rejected: "Rejected"
};

let canonicalEntries = [];

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

function draftActionButtons(draft) {
  return DRAFT_QUEUE_STATUSES.map((status) => {
    const activeClass = status === draft.moderation.queue_status ? "chip active" : "chip";
    return `<button type="button" class="${activeClass}" data-draft-id="${draft.id}" data-status="${status}">${statusLabel[status]}</button>`;
  }).join("");
}

function draftToListItem(draft) {
  const segment = `${draft.street_segment.street_name}, ${draft.street_segment.from_street} to ${draft.street_segment.to_street}`;
  const queueStatus = draft.moderation?.queue_status || "queued";

  return `
    <li>
      <strong>${draft.name}</strong>
      <span>${segment}</span><br />
      <span>Queue: ${statusLabel[queueStatus] || queueStatus}</span><br />
      <span>Created: ${new Date(draft.created_on).toLocaleString()}</span>
      <div class="draft-actions">${draftActionButtons(draft)}</div>
    </li>
  `;
}

function loadDrafts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function persistDrafts(drafts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

function saveDraft(draft) {
  const drafts = loadDrafts();
  drafts.unshift(draft);
  persistDrafts(drafts);
  return drafts;
}

function renderDrafts() {
  const drafts = loadDrafts();
  draftCount.textContent = String(drafts.length);
  draftList.innerHTML = drafts.length ? drafts.map(draftToListItem).join("") : "<li>No queued drafts yet.</li>";
}

function downloadDrafts() {
  const drafts = loadDrafts();
  const blob = new Blob([JSON.stringify(drafts, null, 2)], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = "mini-garden-drafts.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

function applyDraftStatus(draftId, nextStatus) {
  const drafts = loadDrafts();
  const index = drafts.findIndex((item) => item.id === draftId);

  if (index < 0) {
    submissionStatus.textContent = `Draft not found: ${draftId}`;
    submissionStatus.classList.add("error");
    return;
  }

  drafts[index] = updateDraftQueueStatus(drafts[index], nextStatus);
  persistDrafts(drafts);
  renderDrafts();
  submissionStatus.textContent = `Updated draft ${drafts[index].name} -> ${statusLabel[nextStatus]}.`;
  submissionStatus.classList.remove("error");
}

async function loadEntries() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load data (${response.status})`);
  }
  const payload = await response.json();
  return payload.entries || [];
}

async function initEntries() {
  try {
    canonicalEntries = await loadEntries();
    if (canonicalEntries.length === 0) {
      mapStatus.textContent = "No entries available yet.";
      entriesList.innerHTML = "<li>No verified entries.</li>";
      return;
    }

    entriesList.innerHTML = canonicalEntries.map(entryToListItem).join("");
    const focus = canonicalEntries[0];
    mapFrame.src = mapEmbedUrl(focus.coordinates.lat, focus.coordinates.lng);
    mapStatus.textContent = `Showing ${focus.street_segment.street_name} pilot entry.`;
  } catch (error) {
    mapStatus.textContent = `Unable to load map data: ${error.message}`;
    entriesList.innerHTML = "<li>Data failed to load.</li>";
  }
}

submissionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(submissionForm).entries());

  try {
    const draft = buildDraftSubmission(values);
    const duplicatePool = [...loadDrafts(), ...canonicalEntries];

    if (hasDuplicateSubmission(draft, duplicatePool)) {
      throw new Error("Potential duplicate found for this street corridor and name");
    }

    const drafts = saveDraft(draft);
    submissionPreview.textContent = JSON.stringify(draft, null, 2);
    submissionStatus.textContent = `Draft queued locally. Queue depth: ${drafts.length}.`;
    submissionStatus.classList.remove("error");
    submissionForm.reset();
    renderDrafts();
  } catch (error) {
    submissionStatus.textContent = `Could not queue draft: ${error.message}`;
    submissionStatus.classList.add("error");
  }
});

draftList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-draft-id][data-status]");
  if (!button) {
    return;
  }
  applyDraftStatus(button.dataset.draftId, button.dataset.status);
});

downloadDraftsBtn.addEventListener("click", () => {
  downloadDrafts();
  submissionStatus.textContent = "Downloaded local draft queue as JSON.";
  submissionStatus.classList.remove("error");
});

clearDraftsBtn.addEventListener("click", () => {
  persistDrafts([]);
  submissionPreview.textContent = "";
  submissionStatus.textContent = "Cleared local draft queue.";
  submissionStatus.classList.remove("error");
  renderDrafts();
});

initEntries();
renderDrafts();
