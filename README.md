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
- `docs/submission-workflow.md` moderation rubric and queue states
- `docs/anonymous-contributor-profiles.md` anonymous profile model and guardrails
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
- Two verified pilot entries: Jarboe St (Excelsior) and Folsom St corridor (Bernal Heights workflow sample)
- One static map discovery page with neighborhood filtering, two verified canonical entries, queued submission workflow, moderator status controls, duplicate gating, and local draft export
- Anonymous contributor profiles with alias-based trust tiers (no personal identity fields)

## Near-term backlog
Detailed task list: `docs/next-step-backlog.md`

Latest release summary: `CHANGELOG.md`

Retrospective: `docs/mvp-retrospective-2026-02-24.md`
