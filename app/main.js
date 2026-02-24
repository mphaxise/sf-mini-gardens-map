import { buildNeighborhoodOptions, filterEntriesByNeighborhood } from "../lib/entryFilters.mjs";
import {
  applyModerationOutcome,
  ensureProfileForSubmission,
  publicContributorSnapshot
} from "../lib/anonymousContributors.mjs";
import {
  DRAFT_QUEUE_STATUSES,
  buildDraftSubmission,
  hasDuplicateSubmission,
  updateDraftQueueStatus
} from "../lib/submissionDraft.mjs";

const DATA_URL = "../data/mini-gardens.json";
const DRAFT_STORAGE_KEY = "sf-mini-gardens-submission-drafts";
const PROFILE_STORAGE_KEY = "sf-mini-gardens-anonymous-profiles";

const entriesList = document.getElementById("entries");
const mapFrame = document.getElementById("map-frame");
const mapStatus = document.getElementById("map-status");
const neighborhoodFilter = document.getElementById("neighborhood-filter");
const visibleEntryCount = document.getElementById("visible-entry-count");
const submissionForm = document.getElementById("submission-form");
const submissionStatus = document.getElementById("submission-status");
const submissionPreview = document.getElementById("submission-preview");
const draftList = document.getElementById("draft-list");
const draftCount = document.getElementById("draft-count");
const contributorList = document.getElementById("contributor-list");
const contributorCount = document.getElementById("contributor-count");
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

function contributorToListItem(profile) {
  return `
    <li>
      <strong>${profile.public_alias}</strong>
      <span>Anon ID: ${profile.anon_id}</span><br />
      <span>Tier: ${profile.trust_tier}</span><br />
      <span>Submissions: ${profile.contribution_count} | Verified: ${profile.verified_count}</span>
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
  const contributor = draft.contributor || {};

  return `
    <li>
      <strong>${draft.name}</strong>
      <span>${segment}</span><br />
      <span>Contributor: ${contributor.public_alias || "Anonymous"} (${contributor.trust_tier || "seedling"})</span><br />
      <span>Queue: ${statusLabel[queueStatus] || queueStatus}</span><br />
      <span>Created: ${new Date(draft.created_on).toLocaleString()}</span>
      <div class="draft-actions">${draftActionButtons(draft)}</div>
    </li>
  `;
}

function loadDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function persistDrafts(drafts) {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
}

function loadProfiles() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function persistProfiles(profiles) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
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

function renderContributors() {
  const profiles = loadProfiles().sort((a, b) => {
    if ((b.verified_count || 0) !== (a.verified_count || 0)) {
      return (b.verified_count || 0) - (a.verified_count || 0);
    }
    return (b.contribution_count || 0) - (a.contribution_count || 0);
  });

  contributorCount.textContent = String(profiles.length);
  contributorList.innerHTML = profiles.length ? profiles.map(contributorToListItem).join("") : "<li>No anonymous contributors yet.</li>";
}

function renderNeighborhoodOptions(entries) {
  const options = buildNeighborhoodOptions(entries);
  neighborhoodFilter.innerHTML = ['<option value="all">All neighborhoods</option>', ...options.map((name) => `<option value="${name}">${name}</option>`)].join("");
}

function renderCanonicalEntries() {
  const filtered = filterEntriesByNeighborhood(canonicalEntries, neighborhoodFilter.value);
  visibleEntryCount.textContent = String(filtered.length);

  if (filtered.length === 0) {
    entriesList.innerHTML = "<li>No entries for selected neighborhood.</li>";
    mapStatus.textContent = "No map focus for selected neighborhood.";
    mapFrame.removeAttribute("src");
    return;
  }

  entriesList.innerHTML = filtered.map(entryToListItem).join("");
  const focus = filtered[0];
  mapFrame.src = mapEmbedUrl(focus.coordinates.lat, focus.coordinates.lng);
  mapStatus.textContent = `Showing ${focus.street_segment.street_name} (${focus.neighborhood}).`;
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

  const previousStatus = drafts[index].moderation?.queue_status || "queued";
  drafts[index] = updateDraftQueueStatus(drafts[index], nextStatus);

  const moderation = applyModerationOutcome(
    loadProfiles(),
    drafts[index].contributor?.anon_id,
    previousStatus,
    nextStatus
  );

  if (moderation.profile && drafts[index].contributor) {
    drafts[index].contributor.trust_tier = moderation.profile.trust_tier;
  }

  persistProfiles(moderation.profiles);
  persistDrafts(drafts);
  renderDrafts();
  renderContributors();
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
      visibleEntryCount.textContent = "0";
      return;
    }

    renderNeighborhoodOptions(canonicalEntries);
    renderCanonicalEntries();
  } catch (error) {
    mapStatus.textContent = `Unable to load map data: ${error.message}`;
    entriesList.innerHTML = "<li>Data failed to load.</li>";
    visibleEntryCount.textContent = "0";
  }
}

submissionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(submissionForm).entries());

  try {
    const profileResult = ensureProfileForSubmission(loadProfiles(), values.alias, new Date());

    const contributor = publicContributorSnapshot(profileResult.profile);
    const draft = buildDraftSubmission(values, contributor, new Date());
    const duplicatePool = [...loadDrafts(), ...canonicalEntries];

    if (hasDuplicateSubmission(draft, duplicatePool)) {
      throw new Error("Potential duplicate found for this street corridor and name");
    }

    persistProfiles(profileResult.profiles);
    const drafts = saveDraft(draft);
    submissionPreview.textContent = JSON.stringify(draft, null, 2);
    submissionStatus.textContent = `${profileResult.created ? "Created" : "Using"} anonymous alias ${contributor.public_alias}. Queue depth: ${drafts.length}.`;
    submissionStatus.classList.remove("error");
    submissionForm.reset();
    renderDrafts();
    renderContributors();
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

neighborhoodFilter.addEventListener("change", () => {
  renderCanonicalEntries();
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
renderContributors();
