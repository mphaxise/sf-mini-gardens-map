import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { promoteDraftToDataset } from "../lib/promoteDraft.mjs";
import { validateDataset } from "../scripts/validateMiniGardens.mjs";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const datasetPath = path.resolve(currentDir, "..", "data", "mini-gardens.json");
const baseDataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));

function makeDraft(overrides = {}) {
  return {
    id: "sf-draft-new-corridor-20260224235959",
    status: "pending_review",
    city: "San Francisco",
    state: "CA",
    name: "New Corridor Pots",
    neighborhood: "Bernal Heights",
    street_segment: {
      street_name: "Folsom St",
      from_street: "Nevada St",
      to_street: "Powhattan Ave"
    },
    description: "Container mini-garden cluster",
    evidence_note: "Photo + sidewalk observation",
    created_on: "2026-02-24T23:59:59.000Z",
    source: "community-form-draft",
    moderation: {
      queue_status: "verified",
      next_action: "promote_to_canonical_dataset",
      contact_optional: ""
    },
    ...overrides
  };
}

test("promoteDraftToDataset appends canonical entry and remains valid", () => {
  const updated = promoteDraftToDataset(baseDataset, makeDraft(), {
    lat: 37.741,
    lng: -122.411,
    verifiedOn: "2026-02-24",
    lastUpdated: "2026-02-24",
    verifier: "moderator-1"
  });

  assert.equal(updated.entries.length, baseDataset.entries.length + 1);
  const promoted = updated.entries[updated.entries.length - 1];
  assert.equal(promoted.id, "sf-new-corridor-20260224235959");
  assert.equal(promoted.status, "verified");
  assert.equal(promoted.verification.verifier, "moderator-1");

  const errors = validateDataset(updated);
  assert.deepEqual(errors, []);
});

test("promoteDraftToDataset rejects non-verified draft queue state", () => {
  assert.throws(
    () =>
      promoteDraftToDataset(baseDataset, makeDraft({ moderation: { queue_status: "queued" } }), {
        lat: 37.741,
        lng: -122.411,
        verifiedOn: "2026-02-24"
      }),
    /moderation-verified/
  );
});

test("promoteDraftToDataset rejects duplicate canonical ids", () => {
  assert.throws(
    () =>
      promoteDraftToDataset(
        baseDataset,
        makeDraft({ id: "sf-draft-jarboe-ellsworth-gates-001" }),
        {
          lat: 37.741,
          lng: -122.411,
          verifiedOn: "2026-02-24"
        }
      ),
    /id already exists/
  );
});
