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
- `app/` static MVP UI (map + cards + queued draft workflow)
- `lib/` reusable workflow helpers
- `data/submission-draft-template.json` moderation queue payload template
- `docs/submission-workflow.md` moderation rubric and queue states
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
3. Open <http://localhost:4173/app/>

## Current MVP slice
- One schema-driven data model for mini-garden entries
- One verified pilot entry on Jarboe St (between Ellsworth St and Gates St)
- One static map discovery page with a queued submission workflow, moderator status controls, and local draft export

## Near-term backlog

Detailed task list: `docs/next-step-backlog.md`
1. Add moderator actions in UI (`needs_clarification` / `ready_for_geocode` / `verified`) for queued drafts.
2. Add duplicate detection for nearby submissions.
3. Promote approved drafts into canonical `data/mini-gardens.json` through `npm run promote:draft -- --draft ... --lat ... --lng ...`.
