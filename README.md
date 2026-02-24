# SF Mini Gardens Map

Map San Francisco neighborhood mini-gardens for community discovery.

This repository starts a neighborhood-level outdoor discovery product that helps residents find and share resident-created mini-gardens across San Francisco blocks.

## Idea context (extracted)
- Title: Map San Francisco neighborhood mini-gardens for community discovery
- Rank: 1
- Priority: 5
- Source: Manual backlog (user idea)
- Idea link: https://github.com/manual/manual
- Rationale: Creates a neighborhood-level outdoor discovery experience and encourages local community engagement, supported by a real-world example photo of a sidewalk mini-garden cluster.
- First milestone seed: Define data model and add first verified entry: Jarboe St between Ellsworth St and Gates St, San Francisco.
- End-of-day seed: One mini-garden map schema plus seeded SF pilot entry and submission workflow draft.

## Repository layout
- `docs/` strategy and planning artifacts
- `data/` schema and seed entries
- `app/` static MVP UI (map + cards + submission draft flow)
- `scripts/` lightweight validation checks
- `tests/` minimal regression checks for the first slice

## Quick start
1. Run checks:
```bash
npm run check
npm test
```
2. Run local app:
```bash
npm run start
```
3. Open <http://localhost:4173>

## Current MVP slice
- One schema-driven data model for mini-garden entries
- One verified pilot entry on Jarboe St (between Ellsworth St and Gates St)
- One static map discovery page with a submission workflow draft

## Near-term backlog
1. Add geocode verification workflow and provenance fields per submission.
2. Add duplicate detection for nearby submissions.
3. Add moderation queue and status transitions (`pending_review` -> `verified`/`rejected`).
