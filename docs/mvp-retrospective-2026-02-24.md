# MVP Retrospective (2026-02-24)

## Session objective
Ship a first vertical MVP slice for an SF mini-gardens discovery project, publish it, and validate a practical workflow from submission to verified canonical map entries.

## What was shipped
- Public GitHub repo initialized and actively maintained.
- Strategy docs completed (`idea`, `product`, `implementation`, `mvp`).
- Canonical schema + validation checks implemented.
- Static MVP app running locally with map/list view.
- Two verified SF entries in canonical dataset.
- Submission workflow implemented with queue states and moderation actions.
- Duplicate submission gate implemented.
- Draft promotion pipeline implemented (`npm run promote:draft`).
- Anonymous contributor profile system implemented (alias + trust tier, no personal identity fields).
- CI added for validation and tests on push/PR.

## What worked well
- Data-first architecture made rapid iteration easy.
- Small, logical commits kept changes auditable.
- Local script-driven checks prevented schema drift.
- Promotion workflow reduced ambiguity between draft and canonical records.

## What was harder than expected
- Local environment constraints required occasional elevated commands for serving/checking.
- GitHub automation via token had limited permissions in some API calls.
- Privacy-sensitive contributor design required deliberate schema and UI updates to avoid identity leakage.

## Product and technical decisions made
- Keep canonical entries human-readable in JSON for early-stage transparency.
- Treat contributors as anonymous by default.
- Track trust progression via anonymous behavior signals, not personal identity.
- Keep moderation explicit with queue statuses and action labels.

## Current risks
- Local-only queue storage does not support multi-moderator collaboration.
- Anonymous aliases can still be abused without additional policy/rate controls.
- Geocoding and verification quality will vary without stronger tooling.

## Immediate priorities after this retrospective
1. Move moderation queue state from local storage to shared backend storage.
2. Add moderation abuse controls that preserve anonymity.
3. Add richer map exploration (clustering, distance sort, corridor browsing).
