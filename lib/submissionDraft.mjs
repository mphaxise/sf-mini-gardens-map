function normalizeText(value) {
  return String(value ?? "").trim();
}

export const DRAFT_QUEUE_STATUSES = [
  "queued",
  "needs_clarification",
  "ready_for_geocode",
  "verified",
  "rejected"
];

const DRAFT_STATUS_SET = new Set(DRAFT_QUEUE_STATUSES);

function normalizedSegmentPart(value) {
  return normalizeText(value).toLowerCase();
}

function normalizedName(value) {
  return normalizeText(value).toLowerCase().replace(/\s+/g, " ");
}

function assertAnonymousContributor(profile) {
  if (!profile || !normalizeText(profile.anon_id) || !normalizeText(profile.public_alias)) {
    throw new Error("Anonymous contributor profile is required");
  }
}

export function duplicateSignature(item) {
  const streetName = normalizedSegmentPart(item?.street_segment?.street_name || item?.streetName);
  const fromStreet = normalizedSegmentPart(item?.street_segment?.from_street || item?.fromStreet);
  const toStreet = normalizedSegmentPart(item?.street_segment?.to_street || item?.toStreet);

  const sortedCross = [fromStreet, toStreet].sort();
  const corridor = `${streetName}|${sortedCross[0]}|${sortedCross[1]}`;

  return `${normalizedName(item?.name)}|${corridor}`;
}

export function hasDuplicateSubmission(candidate, existingItems) {
  const candidateSig = duplicateSignature(candidate);

  return existingItems.some((item) => {
    if (!item) {
      return false;
    }
    return duplicateSignature(item) === candidateSig;
  });
}

export function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function assertRequired(value, fieldName) {
  if (!normalizeText(value)) {
    throw new Error(`${fieldName} is required`);
  }
}

export function buildDraftSubmission(rawFields, contributorProfile, now = new Date()) {
  const fields = {
    name: normalizeText(rawFields.name),
    streetName: normalizeText(rawFields.streetName),
    fromStreet: normalizeText(rawFields.fromStreet),
    toStreet: normalizeText(rawFields.toStreet),
    neighborhood: normalizeText(rawFields.neighborhood),
    description: normalizeText(rawFields.description),
    evidence: normalizeText(rawFields.evidence)
  };

  assertAnonymousContributor(contributorProfile);
  assertRequired(fields.name, "Garden name");
  assertRequired(fields.streetName, "Street name");
  assertRequired(fields.fromStreet, "From cross street");
  assertRequired(fields.toStreet, "To cross street");
  assertRequired(fields.description, "Description");

  if (fields.fromStreet.toLowerCase() === fields.toStreet.toLowerCase()) {
    throw new Error("Cross streets must be different");
  }

  const timestamp = now.toISOString();
  const idSuffix = timestamp.replace(/[-:.TZ]/g, "").slice(0, 14);
  const nameSlug = slugify(fields.name) || "draft";

  return {
    id: `sf-draft-${nameSlug}-${idSuffix}`,
    status: "pending_review",
    city: "San Francisco",
    state: "CA",
    name: fields.name,
    neighborhood: fields.neighborhood || "TBD",
    street_segment: {
      street_name: fields.streetName,
      from_street: fields.fromStreet,
      to_street: fields.toStreet
    },
    description: fields.description,
    evidence_note: fields.evidence,
    created_on: timestamp,
    source: "community-form-draft",
    contributor: {
      anon_id: contributorProfile.anon_id,
      public_alias: contributorProfile.public_alias,
      trust_tier: contributorProfile.trust_tier || "seedling",
      privacy_mode: "anonymous"
    },
    moderation: {
      queue_status: "queued",
      next_action: "verify_street_segment_and_photo",
      status_notes: ""
    }
  };
}

export function updateDraftQueueStatus(draft, nextStatus, now = new Date()) {
  if (!DRAFT_STATUS_SET.has(nextStatus)) {
    throw new Error(`Invalid draft queue status: ${nextStatus}`);
  }

  const nextActionByStatus = {
    queued: "verify_street_segment_and_photo",
    needs_clarification: "request_submitter_clarification",
    ready_for_geocode: "geocode_and_prepare_canonical_entry",
    verified: "promote_to_canonical_dataset",
    rejected: "archive_with_reason"
  };

  return {
    ...draft,
    moderation: {
      ...(draft.moderation || {}),
      queue_status: nextStatus,
      next_action: nextActionByStatus[nextStatus],
      status_notes: `Updated to ${nextStatus} on ${now.toISOString()}`
    }
  };
}
