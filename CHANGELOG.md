# Changelog

## 2026-02-24

### Added
- Core strategy docs: idea, product, implementation, and MVP plan.
- Canonical mini-garden schema with automated validation checks.
- Static MVP app with map view, canonical entry cards, and submission form.
- Submission workflow enhancements:
  - queued draft storage
  - moderator status controls
  - duplicate detection gate
  - local draft JSON export
  - neighborhood filtering for canonical entries
- Draft-to-canonical promotion pipeline:
  - `npm run promote:draft`
  - promotion safeguards and test coverage
- CI workflow running validation and tests on push/PR.
- Anonymous contributor profile model:
  - alias-based anonymous profiles
  - trust tiers (`seedling`, `sprout`, `canopy`)
  - no personal identity/contact fields in contributor metadata
- Seed-photo public-data exploration feature:
  - `npm run explore:seed` API-only pull from iNaturalist public observations
  - generated exploration artifact in `data/exploration/`
  - suggested loop feature constrained to maximum walk miles (default 2)
  - in-app exploration panel rendering loop summary + public candidates

### Data milestones
- Seeded first verified SF entry:
  - Jarboe St between Ellsworth St and Gates St (Excelsior)
- Added second verified SF workflow sample entry:
  - Folsom St between Nevada St and Powhattan Ave (Bernal Heights)
- Added public exploration artifact from Jarboe seed:
  - 80 nearby observations
  - 2-stop suggested loop
  - 1.246-mile total suggested walk

### Quality
- Test suite expanded to cover data model, anonymous contributor profiles, submission workflow, promotion flow, duplicate detection, neighborhood filtering, and public-data exploration loop logic.

### Documentation
- Added post-MVP retrospective: `docs/mvp-retrospective-2026-02-24.md`.
- Added direction-setting brainstorm: `docs/brainstorm-urban-community-nature.md`.
- Added public data exploration spec: `docs/public-data-exploration.md`.
