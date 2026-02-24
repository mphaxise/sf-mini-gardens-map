function normalizeText(value) {
  return String(value ?? "").trim();
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
      contact_optional: fields.contact
    }
  };
}
