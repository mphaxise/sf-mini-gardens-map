# Product Strategy

## Problem statement
Local mini-gardens are culturally valuable neighborhood assets, but they are hard to discover and not represented in a focused community map.

## Target users
- Primary: residents in SF neighborhoods (walkers, families, local nature fans).
- Secondary: local groups organizing neighborhood beautification.
- Internal: moderators/reviewers who verify submissions.

## Scope (MVP vs later)
### MVP
- One-city pilot centered on SF.
- One verified location published.
- One submission draft flow with clear required fields.

### Later
- User accounts and saved routes.
- Ranking by seasonal freshness and community endorsements.
- Integrations with local events and volunteer cleanups.

## Risks and assumptions
- Assumes discoverability value is high enough for repeat visits.
- Assumes enough signal can be captured from lightweight submissions.
- Risk that moderation load grows quickly once submissions open.

## Architecture and tech choices
- Static-first product slice for shipping speed.
- Human-readable JSON entries to simplify moderation.
- Form-based submission draft to validate UX before backend investment.

## First 60-90 minute milestone
Publish schema + first verified Jarboe entry and expose it through a basic map/list UI.

## End-of-day outcome
A usable pilot page showing one verified mini-garden and a clear submission workflow draft for community contributions.
