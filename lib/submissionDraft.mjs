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

export function buildDraftSubmission(rawFields, now = new Date()) {
  const fields = {
    name: normalizeText(rawFields.name),
    streetName: normalizeText(rawFields.streetName),
    fromStreet: normalizeText(rawFields.fromStreet),
    toStreet: normalizeText(rawFields.toStreet),
    neighborhood: normalizeText(rawFields.neighborhood),
    description: normalizeText(rawFields.description),
    evidence: normalizeText(rawFields.evidence),
    contact: normalizeText(rawFields.contact)
  };

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
    moderation: {
      queue_status: "queued",
      next_action: "verify_street_segment_and_photo",
      contact_optional: fields.contact,
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
