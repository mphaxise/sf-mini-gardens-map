# Implementation Strategy

## Problem statement
The project needs a technically minimal but reliable first slice that proves data structure, map rendering, and submission UX before committing to backend infrastructure.

## Target users
- Contributors adding mini-garden sightings.
- Explorers browsing verified neighborhood spots.
- Maintainers validating data quality.

## Scope (MVP vs later)
### MVP
- Local static app with one seeded entry.
- Validation script for schema-level guardrails.
- Basic test coverage around dataset integrity.

### Later
- API-backed storage and moderation queue.
- Auth and role-based review workflow.
- Geospatial search and filtering.

## Risks and assumptions
- Assumes static JSON can carry early iteration without sync conflicts.
- Risk that loose schema checks allow malformed data.
- Risk of map drift if geocoding is approximate.

## Architecture and tech choices
- Runtime: Node.js for scripts/tests.
- UI: static HTML/CSS/JS for minimal overhead.
- Data: `data/mini-gardens.json` validated by `scripts/validateMiniGardens.mjs`.
- Test framework: built-in `node:test` to avoid dependency setup.

## First 60-90 minute milestone
Build schema + seeded Jarboe entry and pass automated validation/tests locally.

## End-of-day outcome
A committed vertical slice with data schema, pilot record, validation checks, and a browsable map page containing a submission workflow draft.
