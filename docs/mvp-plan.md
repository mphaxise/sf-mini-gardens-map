# MVP Plan

## Problem statement
There is no simple neighborhood product for discovering and contributing SF mini-gardens, despite strong community potential.

## Target users
- SF residents searching for nearby mini-gardens.
- Community contributors documenting new spots.
- Reviewers ensuring entries are accurate and respectful.

## Scope (MVP vs later)
### MVP
- Single schema for mini-garden entries.
- Seed one verified pilot location.
- Show map + listing + submission workflow draft.

### Later
- Multi-entry browsing, filtering, and sort by neighborhood.
- Authenticated submissions and moderation queue.
- Submission media pipeline and richer verification evidence.

## Risks and assumptions
- Assumption: pilot location is sufficient to test discovery UX.
- Assumption: contributors can provide enough location detail to verify.
- Risk: unclear ownership/privacy expectations around frontage gardens.

## Architecture and tech choices
- Flat-file data for low-friction starts.
- Static app for instant hosting and demoability.
- Scripted checks and tests for dataset reliability.

## 60-90 minute first milestone
1. Define JSON schema for mini-garden entries.
2. Add first verified entry for Jarboe St between Ellsworth St and Gates St.
3. Run validation and tests.

## End-of-day outcome
One mini-garden map schema plus seeded SF pilot entry and submission workflow draft, committed and ready for remote push.

## Immediate backlog (next steps)
1. Add a second verified entry from a distinct SF neighborhood to test schema flexibility.
2. Draft moderation rubric (accept/reject reasons and evidence requirements).
3. Add map viewport controls for neighborhood-level browsing.
