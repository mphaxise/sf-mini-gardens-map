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
- `data/` schema, seed entries, and exploration outputs
- `app/` static MVP UI
- `lib/` reusable workflow helpers
- `docs/submission-workflow.md` moderation rubric and queue states
- `docs/anonymous-contributor-profiles.md` anonymous profile model and guardrails
- `docs/public-data-exploration.md` seed-photo public-data exploration approach
- `scripts/` validation and data pipeline scripts
- `tests/` regression checks

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
3. Open <http://localhost:4173/app/>

## Public-data exploration (minimal ingestion)
Generate exploration candidates from one seed location and suggested max walk loop:

```bash
npm run explore:seed -- \
  --seedId sf-jarboe-ellsworth-gates-001 \
  --radiusMiles 2 \
  --maxWalkMiles 2 \
  --maxStops 4 \
  --perPage 80
```

## Current MVP slice
- One schema-driven data model for mini-garden entries
- Two verified pilot entries: Jarboe St (Excelsior) and Folsom St corridor (Bernal Heights workflow sample)
- Static discovery page with neighborhood filtering, canonical entries, and map view
- Anonymous contributor profiles with alias-based trust tiers (no personal identity fields)
- Submission moderation queue with status controls and duplicate gating
- Seed-photo public-data exploration panel with suggested up-to-2-mile walk loop from API-only data pull

## Return reminder
When you come back, start here: `docs/next-session-start-here.md`

## Project docs
- Backlog: `docs/next-step-backlog.md`
- Release summary: `CHANGELOG.md`
- Retrospective: `docs/mvp-retrospective-2026-02-24.md`
- Brainstorm directions: `docs/brainstorm-urban-community-nature.md`
