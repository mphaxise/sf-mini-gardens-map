import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_ENTRY_FIELDS = [
  "id",
  "name",
  "status",
  "city",
  "state",
  "neighborhood",
  "description",
  "visit_notes",
  "privacy_level"
];

const STATUS_VALUES = new Set(["verified", "pending_review", "rejected"]);
const PRIVACY_VALUES = new Set(["public-street-visible", "sensitive"]);

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export function validateMiniGarden(entry, index = 0) {
  const errors = [];
  const prefix = `entries[${index}]`;

  if (!isObject(entry)) {
    return [`${prefix} must be an object`];
  }

  for (const field of REQUIRED_ENTRY_FIELDS) {
    if (!hasText(entry[field])) {
      errors.push(`${prefix}.${field} is required`);
    }
  }

  if (hasText(entry.status) && !STATUS_VALUES.has(entry.status)) {
    errors.push(`${prefix}.status must be one of: ${Array.from(STATUS_VALUES).join(", ")}`);
  }

  if (hasText(entry.privacy_level) && !PRIVACY_VALUES.has(entry.privacy_level)) {
    errors.push(`${prefix}.privacy_level must be one of: ${Array.from(PRIVACY_VALUES).join(", ")}`);
  }

  if (entry.city !== "San Francisco") {
    errors.push(`${prefix}.city must be 'San Francisco' for this pilot`);
  }

  if (entry.state !== "CA") {
    errors.push(`${prefix}.state must be 'CA'`);
  }

  if (!isObject(entry.street_segment)) {
    errors.push(`${prefix}.street_segment must be an object`);
  } else {
    for (const segmentField of ["street_name", "from_street", "to_street"]) {
      if (!hasText(entry.street_segment[segmentField])) {
        errors.push(`${prefix}.street_segment.${segmentField} is required`);
      }
    }
  }

  if (!isObject(entry.coordinates)) {
    errors.push(`${prefix}.coordinates must be an object`);
  } else {
    const { lat, lng } = entry.coordinates;
    if (!isFiniteNumber(lat) || lat < -90 || lat > 90) {
      errors.push(`${prefix}.coordinates.lat must be a valid latitude`);
    }
    if (!isFiniteNumber(lng) || lng < -180 || lng > 180) {
      errors.push(`${prefix}.coordinates.lng must be a valid longitude`);
    }

    // Pilot guardrail: keep seed entries in San Francisco bounds.
    if (isFiniteNumber(lat) && isFiniteNumber(lng)) {
      if (lat < 37.70 || lat > 37.84 || lng < -122.53 || lng > -122.35) {
        errors.push(`${prefix}.coordinates must fall within San Francisco bounding box`);
      }
    }
  }

  if (!Array.isArray(entry.plant_highlights) || entry.plant_highlights.length === 0) {
    errors.push(`${prefix}.plant_highlights must contain at least one item`);
  }

  if (!isObject(entry.verification)) {
    errors.push(`${prefix}.verification must be an object`);
  } else {
    for (const field of ["verified_on", "evidence", "verifier"]) {
      if (!hasText(entry.verification[field])) {
        errors.push(`${prefix}.verification.${field} is required`);
      }
    }
  }

  if (!isObject(entry.submission)) {
    errors.push(`${prefix}.submission must be an object`);
  } else {
    for (const field of ["source", "created_on", "contact_optional"]) {
      if (typeof entry.submission[field] !== "string") {
        errors.push(`${prefix}.submission.${field} must be a string`);
      }
    }
  }

  return errors;
}

export function validateDataset(dataset) {
  const errors = [];

  if (!isObject(dataset)) {
    return ["dataset must be an object"];
  }

  if (!hasText(dataset.schema_version)) {
    errors.push("schema_version is required");
  }

  if (!hasText(dataset.last_updated)) {
    errors.push("last_updated is required");
  }

  if (!Array.isArray(dataset.entries) || dataset.entries.length === 0) {
    errors.push("entries must be a non-empty array");
    return errors;
  }

  const seenIds = new Set();
  dataset.entries.forEach((entry, index) => {
    errors.push(...validateMiniGarden(entry, index));

    if (hasText(entry?.id)) {
      if (seenIds.has(entry.id)) {
        errors.push(`entries[${index}].id duplicates a prior id`);
      }
      seenIds.add(entry.id);
    }
  });

  return errors;
}

function runCli() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const datasetPath = path.join(root, "data", "mini-gardens.json");
  const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
  const errors = validateDataset(dataset);

  if (errors.length > 0) {
    console.error("Mini-garden dataset validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Validation passed for ${dataset.entries.length} mini-garden entr${dataset.entries.length === 1 ? "y" : "ies"}.`);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  runCli();
}
