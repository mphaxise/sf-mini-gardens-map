# Idea Strategy

## Problem statement
San Francisco residents create sidewalk mini-gardens, but discovery is fragmented and mostly word-of-mouth. People nearby have no lightweight way to find these spaces, understand where they are, or contribute verified sightings.

## Target users
- Neighborhood residents who want local outdoor discoveries.
- Casual walkers exploring nearby blocks.
- Community contributors who can document and verify mini-garden spots.

## Scope (MVP vs later)
### MVP
- Define a single mini-garden data schema.
- Seed one verified SF pilot entry.
- Provide a draft submission workflow for new entries.

### Later
- Multi-neighborhood expansion across San Francisco.
- Contributor trust scoring and moderation roles.
- Rich media galleries and seasonal update tracking.

## Risks and assumptions
- Assumes residents are willing to submit and verify entries.
- Risk of location inaccuracies without verification controls.
- Risk of privacy concerns for residential frontage gardens.

## Architecture and tech choices
- JSON-first data model and seed file for fast iteration.
- Static web app MVP to avoid backend setup friction.
- Scripted validation checks to protect seed data quality.

## First 60-90 minute milestone
Define the mini-garden schema and add the first verified entry: Jarboe St between Ellsworth St and Gates St, San Francisco.

## End-of-day outcome
One mini-garden map schema plus seeded SF pilot entry and submission workflow draft.
