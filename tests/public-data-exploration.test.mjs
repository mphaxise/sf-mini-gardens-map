import assert from "node:assert/strict";
import test from "node:test";

import {
  buildInatObservationsUrl,
  buildObservationCandidates,
  haversineMiles,
  milesToKm,
  planLoopWalk
} from "../lib/publicDataExploration.mjs";

test("milesToKm converts expected value", () => {
  assert.equal(Number(milesToKm(2).toFixed(3)), 3.219);
});

test("haversineMiles is near-zero for identical points", () => {
  const point = { lat: 37.72, lng: -122.43 };
  assert.ok(haversineMiles(point, point) < 0.001);
});

test("buildObservationCandidates filters and sorts by distance", () => {
  const seed = { lat: 37.7263, lng: -122.4377 };
  const observations = [
    {
      id: 1,
      geojson: { coordinates: [-122.4377, 37.7263] },
      photos: [{ url: "https://example.com/square.jpg" }],
      taxon: { preferred_common_name: "Rose", name: "Rosa" },
      uri: "https://example.com/1"
    },
    {
      id: 2,
      geojson: { coordinates: [-122.60, 37.80] },
      photos: [{ url: "https://example.com/square.jpg" }],
      uri: "https://example.com/2"
    }
  ];

  const candidates = buildObservationCandidates(observations, seed, 2);
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].id, 1);
  assert.equal(candidates[0].photo_url, "https://example.com/medium.jpg");
});

test("planLoopWalk respects walk budget", () => {
  const seed = { lat: 37.7263, lng: -122.4377 };
  const candidates = [
    {
      id: 101,
      coordinates: { lat: 37.7268, lng: -122.4372 },
      distance_from_seed_miles: 0.05
    },
    {
      id: 102,
      coordinates: { lat: 37.7272, lng: -122.4369 },
      distance_from_seed_miles: 0.09
    }
  ];

  const loop = planLoopWalk(seed, candidates, 0.5, 4);
  assert.ok(loop.total_miles <= 0.5);
  assert.ok(loop.stop_count >= 1);
});

test("buildInatObservationsUrl includes radius and coords", () => {
  const url = buildInatObservationsUrl({ lat: 37.72, lng: -122.43 }, 2, 30);
  assert.match(url, /api\.inaturalist\.org\/v1\/observations/);
  assert.match(url, /lat=37\.72/);
  assert.match(url, /lng=-122\.43/);
  assert.match(url, /per_page=30/);
});
