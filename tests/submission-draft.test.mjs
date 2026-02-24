import assert from "node:assert/strict";
import test from "node:test";

import { buildDraftSubmission, slugify } from "../lib/submissionDraft.mjs";

test("slugify normalizes mixed text", () => {
  assert.equal(slugify("Elm Alley Pot Cluster"), "elm-alley-pot-cluster");
  assert.equal(slugify("  301! Jarboe Garden  "), "301-jarboe-garden");
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
