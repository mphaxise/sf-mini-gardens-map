import assert from "node:assert/strict";
import test from "node:test";

import {
  DRAFT_QUEUE_STATUSES,
  buildDraftSubmission,
  duplicateSignature,
  hasDuplicateSubmission,
  slugify,
  updateDraftQueueStatus
} from "../lib/submissionDraft.mjs";

test("draft status list includes expected moderation states", () => {
  assert.deepEqual(DRAFT_QUEUE_STATUSES, [
    "queued",
    "needs_clarification",
    "ready_for_geocode",
    "verified",
    "rejected"
  ]);
});

test("slugify normalizes mixed text", () => {
  assert.equal(slugify("Elm Alley Pot Cluster"), "elm-alley-pot-cluster");
  assert.equal(slugify("  301! Jarboe Garden  "), "301-jarboe-garden");
});

test("duplicateSignature normalizes corridor regardless of cross-street order", () => {
  const a = {
    name: "Elm Alley Pot Cluster",
    street_segment: {
      street_name: "Jarboe St",
      from_street: "Ellsworth St",
      to_street: "Gates St"
    }
  };

  const b = {
    name: "elm alley pot cluster",
    street_segment: {
      street_name: "jarboe st",
      from_street: "Gates St",
      to_street: "Ellsworth St"
    }
  };

  assert.equal(duplicateSignature(a), duplicateSignature(b));
});

test("hasDuplicateSubmission flags equivalent candidate", () => {
  const candidate = {
    name: "Elm Alley Pot Cluster",
    street_segment: {
      street_name: "Jarboe St",
      from_street: "Ellsworth St",
      to_street: "Gates St"
    }
  };

  const existing = [
    {
      name: "Jarboe Street Sidewalk Mini-Garden",
      street_segment: {
        street_name: "Jarboe St",
        from_street: "Ellsworth St",
        to_street: "Gates St"
      }
    },
    {
      name: "Elm Alley Pot Cluster",
      street_segment: {
        street_name: "Jarboe St",
        from_street: "Gates St",
        to_street: "Ellsworth St"
      }
    }
  ];

  assert.equal(hasDuplicateSubmission(candidate, existing), true);
});

test("buildDraftSubmission returns normalized queued draft", () => {
  const fixed = new Date("2026-02-24T23:10:11.000Z");
  const draft = buildDraftSubmission(
    {
      name: "Elm Alley Pot Cluster",
      streetName: "Jarboe St",
      fromStreet: "Ellsworth St",
      toStreet: "Gates St",
      neighborhood: "Excelsior",
      description: "Container plants along a sidewalk frontage.",
      evidence: "Photo shows hanging baskets",
      contact: "example@neighborhood.org"
    },
    fixed
  );

  assert.equal(draft.id, "sf-draft-elm-alley-pot-cluster-20260224231011");
  assert.equal(draft.status, "pending_review");
  assert.equal(draft.city, "San Francisco");
  assert.equal(draft.street_segment.street_name, "Jarboe St");
  assert.equal(draft.moderation.queue_status, "queued");
  assert.equal(draft.moderation.contact_optional, "example@neighborhood.org");
});

test("updateDraftQueueStatus updates status and action", () => {
  const draft = buildDraftSubmission({
    name: "Test Spot",
    streetName: "Mission St",
    fromStreet: "20th St",
    toStreet: "21st St",
    description: "Small frontage garden"
  });

  const updated = updateDraftQueueStatus(draft, "ready_for_geocode", new Date("2026-02-24T23:20:00.000Z"));
  assert.equal(updated.moderation.queue_status, "ready_for_geocode");
  assert.equal(updated.moderation.next_action, "geocode_and_prepare_canonical_entry");
  assert.match(updated.moderation.status_notes, /ready_for_geocode/);
});

test("buildDraftSubmission rejects identical cross streets", () => {
  assert.throws(
    () =>
      buildDraftSubmission({
        name: "Test",
        streetName: "Mission St",
        fromStreet: "19th St",
        toStreet: "19th St",
        description: "test"
      }),
    /Cross streets must be different/
  );
});

test("updateDraftQueueStatus rejects unknown status", () => {
  const draft = buildDraftSubmission({
    name: "Test Spot",
    streetName: "Mission St",
    fromStreet: "20th St",
    toStreet: "21st St",
    description: "Small frontage garden"
  });

  assert.throws(() => updateDraftQueueStatus(draft, "not_real"), /Invalid draft queue status/);
});
