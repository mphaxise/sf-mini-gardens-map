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
- Draft-to-canonical promotion pipeline:
  - `npm run promote:draft`
  - promotion safeguards and test coverage
- Neighborhood filter for canonical entries and map focus.
- CI workflow running validation and tests on push/PR.

### Data milestones
- Seeded first verified SF entry:
  - Jarboe St between Ellsworth St and Gates St (Excelsior)
- Added second verified SF workflow sample entry:
  - Folsom St between Nevada St and Powhattan Ave (Bernal Heights)

### Quality
- Test suite expanded to cover data model, submission workflow, promotion flow, duplicate detection, and neighborhood filtering.
