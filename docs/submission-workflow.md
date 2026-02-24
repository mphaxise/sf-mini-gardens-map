# Submission Workflow Draft

## Goal
Provide a simple and respectful flow for collecting mini-garden sightings, then moving them through human verification before publishing as `verified` entries.

## Draft fields (community form)
- Garden name
- Street name
- From/To cross streets
- Neighborhood hint (optional)
- Short description
- Evidence note or photo reference hint (optional)
- Contact handle/email (optional)

## Moderation queue states
1. `queued`: draft saved, awaiting reviewer triage.
2. `needs_clarification`: reviewer requests better cross-street/evidence detail.
3. `ready_for_geocode`: location details are sufficient for map pin prep.
4. `verified`: reviewer confirms details; entry can be promoted to canonical dataset.
5. `rejected`: insufficient evidence or privacy/safety concern.

## Reviewer checklist
- Confirm the street segment has two distinct cross streets.
- Confirm the location is in San Francisco and publicly sidewalk-visible.
- Confirm the description/evidence does not expose sensitive personal details.
- Mark outcome and notes; if accepted, migrate into `data/mini-gardens.json` with full schema fields.

## Privacy guardrails
- Publish only publicly visible frontage details.
- Do not publish private contact info in public dataset entries.
- Avoid exact house-level metadata unless already visible from public right-of-way and necessary for wayfinding.
