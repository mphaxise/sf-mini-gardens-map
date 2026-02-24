# Anonymous Contributor Profiles

## Product stance
Contributors remain anonymous by default. The system tracks contribution quality without storing personal identity.

## Public profile fields
- `anon_id`: stable anonymous identifier (`anon-...`).
- `public_alias`: contributor-selected alias (or generated pseudonym).
- `trust_tier`: `seedling`, `sprout`, or `canopy`.
- `contribution_count`: number of submitted drafts.
- `verified_count`: number of drafts promoted to verified canonical entries.

## What is intentionally not collected
- Real names
- Email addresses
- Phone numbers
- Social handles
- Any direct personally identifying contact info

## Trust tier logic
- `seedling`: new or low-volume anonymous contributor.
- `sprout`: moderate contribution history or verification history.
- `canopy`: high sustained anonymous contribution history.

## Local implementation details
- Anonymous profiles are stored in browser local storage as non-PII JSON.
- Submissions reference contributor metadata via `contributor.anon_id` and alias.
- Canonical promoted entries keep anonymous submission provenance under `submission.*` fields.

## Follow-up hardening
- Add profanity/abuse filtering for aliases.
- Add rate limits per anonymous profile.
- Add moderation-only salted fingerprinting to reduce abuse without exposing identity.
