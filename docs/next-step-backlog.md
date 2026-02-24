# Next-Step Backlog

## Current state
- Public repo is live with strategy docs, validated seed data, and a static MVP page.
- Two verified SF pilot entries are published in the canonical dataset.
- Draft submissions can be queued locally, moderated, deduplicated, exported, and promoted.
- Contributor profiles are anonymous-by-default with alias-based trust tiers.

## Completed execution tasks
1. Add moderator actions in UI ✅ done
- Deliverable: controls for `needs_clarification`, `ready_for_geocode`, `verified`, and `rejected` on each queued draft.
- Acceptance: status change updates the rendered queue and persists in local storage.

2. Build draft-to-canonical promotion script ✅ done
- Deliverable: `scripts/promoteDraft.mjs` that takes one queued draft JSON and appends a schema-complete entry to `data/mini-gardens.json`.
- Acceptance: `npm run check` remains green after promotion.

3. Add duplicate detection gate ✅ done
- Deliverable: draft ingest check that blocks submissions with identical street segment + near-identical name.
- Acceptance: duplicate candidate is rejected with a clear message.

4. Add neighborhood filtering in map/list view ✅ done
- Deliverable: filter control for neighborhood values in canonical entries.
- Acceptance: list and map focus update based on selected neighborhood.

5. Add second verified entry ✅ done
- Deliverable: one additional SF verified record with evidence and moderation notes.
- Acceptance: tests pass and UI renders at least two verified entries.

6. Add anonymous contributor profiles ✅ done
- Deliverable: alias-based contributor model with no personal identity fields.
- Acceptance: submissions and promotions include anonymous contributor metadata only.

## Suggested next tasks
1. Replace static serving with a lightweight API service for shared moderation queue state.
2. Add map clustering and distance-based discovery sorting.
3. Add moderation-only abuse defenses (hashed fingerprints, rate limits, alias policy checks) without exposing identity.
