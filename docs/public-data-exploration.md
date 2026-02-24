# Public Data Exploration (Seed Photo + Location)

## Goal
Test whether publicly available community nature data can enrich mini-garden discovery with minimal collection overhead and no scraping.

## Current implementation
- Input: one seed canonical entry (`sf-jarboe-ellsworth-gates-001`) with photo context and coordinates.
- Source: iNaturalist public observations API (API mode, no page scraping).
- Output: nearby public observations + a suggested loop constrained to a maximum walk distance.

## Command
```bash
npm run explore:seed -- \
  --seedId sf-jarboe-ellsworth-gates-001 \
  --radiusMiles 2 \
  --maxWalkMiles 2 \
  --maxStops 4 \
  --perPage 80
```

## Generated artifact
- `data/exploration/seed-walk-sf-jarboe-ellsworth-gates-001.json`

The artifact includes:
- source metadata (`pull_mode: api`, `scraping_mode: none`)
- seed context and constraints
- candidate public observations
- suggested loop summary and stops

## Current result snapshot
- Candidate observations found: 80
- Suggested loop: 2 stops
- Estimated loop length: 1.246 miles
- Remaining budget inside 2-mile cap: 0.754 miles

## Why this is minimal
- Uses one seed location instead of broad crawling.
- Uses one public API endpoint instead of multi-site ingestion.
- Stores only high-level observation metadata needed for exploration.
- Treats this as exploratory enrichment, not canonical truth.

## Next iteration options
1. Add a second source adapter (for comparison) while keeping API-only ingestion.
2. Add a relevance filter tuned to mini-garden-like observations.
3. Add a UI control for walk cap (1.0, 1.5, 2.0 miles).
