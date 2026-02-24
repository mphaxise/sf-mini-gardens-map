import assert from "node:assert/strict";
import test from "node:test";

import {
  applyModerationOutcome,
  computeTrustTier,
  ensureProfileForSubmission,
  publicContributorSnapshot,
  sanitizeAlias
} from "../lib/anonymousContributors.mjs";

test("sanitizeAlias removes non-public characters", () => {
  assert.equal(sanitizeAlias("  Foggy@Planter!!  "), "FoggyPlanter");
});

test("ensureProfileForSubmission creates and increments anonymous profile", () => {
  const created = ensureProfileForSubmission([], "Foggy Planter", new Date("2026-02-24T23:00:00.000Z"));

  assert.equal(created.created, true);
  assert.equal(created.profile.public_alias, "Foggy Planter");
  assert.equal(created.profile.contribution_count, 1);
  assert.equal(created.profile.trust_tier, "seedling");
});

test("ensureProfileForSubmission reuses alias case-insensitively", () => {
  const start = [
    {
      anon_id: "anon-reuse",
      public_alias: "Foggy Planter",
      privacy_mode: "anonymous",
      joined_on: "2026-02-24",
      contribution_count: 3,
      verified_count: 1,
      trust_tier: "seedling"
    }
  ];

  const reused = ensureProfileForSubmission(start, "foggy planter", new Date("2026-02-24T23:01:00.000Z"));
  assert.equal(reused.created, false);
  assert.equal(reused.profile.anon_id, "anon-reuse");
  assert.equal(reused.profile.contribution_count, 4);
  assert.equal(reused.profile.trust_tier, "sprout");
});

test("applyModerationOutcome increments verified count only on verified transition", () => {
  const profiles = [
    {
      anon_id: "anon-reuse",
      public_alias: "Foggy Planter",
      privacy_mode: "anonymous",
      joined_on: "2026-02-24",
      contribution_count: 4,
      verified_count: 1,
      trust_tier: "sprout"
    }
  ];

  const changed = applyModerationOutcome(profiles, "anon-reuse", "queued", "verified");
  assert.equal(changed.profile.verified_count, 2);

  const unchanged = applyModerationOutcome(changed.profiles, "anon-reuse", "verified", "verified");
  assert.equal(unchanged.profile.verified_count, 2);
});

test("publicContributorSnapshot exposes only public anonymous fields", () => {
  const snapshot = publicContributorSnapshot({
    anon_id: "anon-reuse",
    public_alias: "Foggy Planter",
    trust_tier: "sprout",
    privacy_mode: "anonymous",
    contribution_count: 4
  });

  assert.deepEqual(snapshot, {
    anon_id: "anon-reuse",
    public_alias: "Foggy Planter",
    trust_tier: "sprout",
    privacy_mode: "anonymous"
  });
});

test("computeTrustTier follows seedling/sprout/canopy progression", () => {
  assert.equal(computeTrustTier(1, 0), "seedling");
  assert.equal(computeTrustTier(4, 1), "sprout");
  assert.equal(computeTrustTier(12, 1), "canopy");
});
