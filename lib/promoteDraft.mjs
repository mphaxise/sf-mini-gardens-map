export function normalizeDate(input) {
  if (!input) {
    return new Date().toISOString().slice(0, 10);
  }
  const candidate = String(input).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    throw new Error(`Invalid date format: ${input}`);
  }
  return candidate;
}

function normalizeNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${label} must be a finite number`);
  }
  return number;
}

function toDateOnly(iso) {
  return String(iso || "").slice(0, 10);
}

function canonicalIdFromDraftId(draftId) {
  const stripped = String(draftId || "").replace(/^sf-draft-/, "sf-");
  if (!/^sf-[a-z0-9-]+$/.test(stripped)) {
    throw new Error(`Draft id cannot be promoted to canonical id: ${draftId}`);
  }
  return stripped;
}

export function buildCanonicalEntryFromDraft(draft, options = {}) {
  if (!draft || typeof draft !== "object") {
    throw new Error("Draft must be an object");
  }

  const queueStatus = draft?.moderation?.queue_status;
  if (queueStatus !== "verified") {
    throw new Error(`Draft must be moderation-verified before promotion (current: ${queueStatus || "unknown"})`);
  }

  const lat = normalizeNumber(options.lat, "lat");
  const lng = normalizeNumber(options.lng, "lng");
  const verifiedOn = normalizeDate(options.verifiedOn);
  const verifier = String(options.verifier || "community-moderator").trim() || "community-moderator";

  return {
    id: canonicalIdFromDraftId(draft.id),
    name: draft.name,
    status: "verified",
    city: draft.city || "San Francisco",
    state: draft.state || "CA",
    street_segment: {
      street_name: draft.street_segment?.street_name,
      from_street: draft.street_segment?.from_street,
      to_street: draft.street_segment?.to_street
    },
    coordinates: {
      lat,
      lng
    },
    neighborhood: draft.neighborhood || "TBD",
    description: draft.description || "Community-submitted mini-garden",
    plant_highlights: ["Community-submitted mini-garden"],
    visit_notes: "Publicly visible from the street. Respect resident space and keep sidewalks clear.",
    privacy_level: "public-street-visible",
    verification: {
      verified_on: verifiedOn,
      evidence: draft.evidence_note || "Promoted from verified community draft",
      verifier
    },
    submission: {
      source: draft.source || "community-form-draft",
      created_on: normalizeDate(toDateOnly(draft.created_on) || verifiedOn),
      contact_optional: draft?.moderation?.contact_optional || ""
    }
  };
}

function isSameCorridor(a, b) {
  return (
    a.street_segment?.street_name === b.street_segment?.street_name &&
    a.street_segment?.from_street === b.street_segment?.from_street &&
    a.street_segment?.to_street === b.street_segment?.to_street
  );
}

export function promoteDraftToDataset(dataset, draft, options = {}) {
  if (!dataset || typeof dataset !== "object" || !Array.isArray(dataset.entries)) {
    throw new Error("Dataset must contain an entries array");
  }

  const canonicalEntry = buildCanonicalEntryFromDraft(draft, options);

  if (dataset.entries.some((entry) => entry.id === canonicalEntry.id)) {
    throw new Error(`Cannot promote draft: id already exists (${canonicalEntry.id})`);
  }

  if (dataset.entries.some((entry) => entry.name === canonicalEntry.name && isSameCorridor(entry, canonicalEntry))) {
    throw new Error("Cannot promote draft: matching name and street corridor already exists");
  }

  return {
    ...dataset,
    last_updated: normalizeDate(options.lastUpdated || options.verifiedOn),
    entries: [...dataset.entries, canonicalEntry]
  };
}
