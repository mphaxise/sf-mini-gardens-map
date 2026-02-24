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
const EXPLORATION_URL = "../data/exploration/seed-walk-sf-jarboe-ellsworth-gates-001.json";
const DRAFT_STORAGE_KEY = "sf-mini-gardens-submission-drafts";
const PROFILE_STORAGE_KEY = "sf-mini-gardens-anonymous-profiles";

const entriesList = document.getElementById("entries");
const mapFrame = document.getElementById("map-frame");
const mapStatus = document.getElementById("map-status");
const neighborhoodFilter = document.getElementById("neighborhood-filter");
const visibleEntryCount = document.getElementById("visible-entry-count");

const explorationStatus = document.getElementById("exploration-status");
const explorationSource = document.getElementById("exploration-source");
const loopSummary = document.getElementById("loop-summary");
const loopStops = document.getElementById("loop-stops");
const explorationCandidates = document.getElementById("exploration-candidates");

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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
      <strong>${escapeHtml(entry.name)}</strong>
      <span>${escapeHtml(segment)}</span><br />
      <span>${escapeHtml(entry.neighborhood)}, ${escapeHtml(entry.city)}</span><br />
      <span>Status: ${escapeHtml(entry.status)}</span>
      <p>${escapeHtml(entry.description)}</p>
    </li>
  `;
}

function contributorToListItem(profile) {
  return `
    <li>
      <strong>${escapeHtml(profile.public_alias)}</strong>
      <span>Anon ID: ${escapeHtml(profile.anon_id)}</span><br />
      <span>Tier: ${escapeHtml(profile.trust_tier)}</span><br />
      <span>Submissions: ${escapeHtml(profile.contribution_count)} | Verified: ${escapeHtml(profile.verified_count)}</span>
    </li>
  `;
}

function draftActionButtons(draft) {
  return DRAFT_QUEUE_STATUSES.map((status) => {
    const activeClass = status === draft.moderation.queue_status ? "chip active" : "chip";
    return `<button type="button" class="${activeClass}" data-draft-id="${escapeHtml(draft.id)}" data-status="${escapeHtml(status)}">${escapeHtml(statusLabel[status])}</button>`;
  }).join("");
}

function draftToListItem(draft) {
  const segment = `${draft.street_segment.street_name}, ${draft.street_segment.from_street} to ${draft.street_segment.to_street}`;
  const queueStatus = draft.moderation?.queue_status || "queued";
  const contributor = draft.contributor || {};

  return `
    <li>
      <strong>${escapeHtml(draft.name)}</strong>
      <span>${escapeHtml(segment)}</span><br />
      <span>Contributor: ${escapeHtml(contributor.public_alias || "Anonymous")} (${escapeHtml(contributor.trust_tier || "seedling")})</span><br />
      <span>Queue: ${escapeHtml(statusLabel[queueStatus] || queueStatus)}</span><br />
      <span>Created: ${escapeHtml(new Date(draft.created_on).toLocaleString())}</span>
      <div class="draft-actions">${draftActionButtons(draft)}</div>
    </li>
  `;
}

function explorationCandidateToListItem(candidate) {
  const species = candidate.species_common_name || "Unknown";
  const scientific = candidate.species_scientific_name ? ` (${candidate.species_scientific_name})` : "";
  const place = candidate.place_guess || "Location not specified";
  const photo = candidate.photo_url
    ? `<img class="exploration-photo" src="${escapeHtml(candidate.photo_url)}" alt="${escapeHtml(species)}" loading="lazy" />`
    : "";

  return `
    <li>
      ${photo}
      <strong>${escapeHtml(species)}${escapeHtml(scientific)}</strong>
      <span>${escapeHtml(place)}</span><br />
      <span>${escapeHtml(candidate.distance_from_seed_miles)} miles from seed</span><br />
      <a href="${escapeHtml(candidate.observation_url)}" target="_blank" rel="noreferrer">View public observation</a>
    </li>
  `;
}

function loopStopToListItem(stop, index) {
  const species = stop.species_common_name || "Unknown";
  return `<li>Stop ${index + 1}: ${escapeHtml(species)} at ${escapeHtml(stop.distance_from_seed_miles)} miles from seed (${escapeHtml(stop.distance_from_previous_miles)} miles from previous stop)</li>`;
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
  neighborhoodFilter.innerHTML = ['<option value="all">All neighborhoods</option>', ...options.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)].join("");
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

function renderExploration(exploration) {
  const loop = exploration?.suggested_loop;
  const candidates = exploration?.top_candidates || [];
  const source = exploration?.source || {};
  const ingestion = exploration?.ingestion || {};

  explorationStatus.textContent = `Seed ${exploration.seed.entry_id}: ${ingestion.candidate_count || 0} nearby public observations found.`;
  explorationSource.textContent = `Source: ${source.provider || "Unknown"}. Pull mode: ${source.pull_mode || "n/a"}. Scraping mode: ${source.scraping_mode || "n/a"}.`;

  loopSummary.textContent = `Loop budget ${loop.max_walk_miles} miles. Suggested ${loop.stop_count} stops, total ${loop.total_miles} miles, remaining ${loop.remaining_miles} miles.`;
  loopStops.innerHTML = loop.stop_count > 0
    ? loop.stops.map(loopStopToListItem).join("")
    : "<li>No feasible stops inside walk budget.</li>";

  explorationCandidates.innerHTML = candidates.length
    ? candidates.slice(0, 6).map(explorationCandidateToListItem).join("")
    : "<li>No public observation candidates loaded.</li>";
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

async function loadExplorationData() {
  const response = await fetch(EXPLORATION_URL);
  if (!response.ok) {
    throw new Error(`Failed to load exploration data (${response.status})`);
  }
  return response.json();
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

async function initExploration() {
  try {
    const exploration = await loadExplorationData();
    renderExploration(exploration);
  } catch (error) {
    explorationStatus.textContent = `Exploration unavailable: ${error.message}`;
    explorationSource.textContent = "Run `npm run explore:seed` to refresh public exploration data.";
    loopSummary.textContent = "";
    loopStops.innerHTML = "<li>Exploration data is not loaded.</li>";
    explorationCandidates.innerHTML = "<li>No exploration candidates available.</li>";
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
initExploration();
renderDrafts();
renderContributors();
