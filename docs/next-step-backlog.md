# Next-Step Backlog

## Current state
- Public repo is live with strategy docs, validated seed data, and a static MVP page.
- One verified pilot entry is published for Jarboe St between Ellsworth St and Gates St.
- Draft submissions can be queued locally and exported as JSON.

## Next 5 execution tasks
1. Add moderator actions in UI
- Deliverable: controls for `needs_clarification`, `ready_for_geocode`, `verified`, and `rejected` on each queued draft.
- Acceptance: status change updates the rendered queue and persists in local storage.

2. Build draft-to-canonical promotion script
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

## Suggested execution order
1. Moderator actions in UI.
2. Promotion script.
3. Duplicate detection.
4. Neighborhood filtering.
5. Second verified entry.
