import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildInatObservationsUrl,
  buildObservationCandidates,
  planLoopWalk
} from "../lib/publicDataExploration.mjs";

function parseArgs(argv) {
  const args = {
    seedId: "sf-jarboe-ellsworth-gates-001",
    radiusMiles: 2,
    maxWalkMiles: 2,
    maxStops: 4,
    perPage: 60
  };

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];

    if (!key.startsWith("--")) {
      continue;
    }

    const name = key.slice(2);
    if (value && !value.startsWith("--")) {
      if (["radiusMiles", "maxWalkMiles", "maxStops", "perPage"].includes(name)) {
        args[name] = Number(value);
      } else {
        args[name] = value;
      }
      i += 1;
    }
  }

  return args;
}

function loadDataset(rootDir) {
  const datasetPath = path.join(rootDir, "data", "mini-gardens.json");
  return JSON.parse(fs.readFileSync(datasetPath, "utf8"));
}

function buildSeedContext(entry) {
  return {
    entry_id: entry.id,
    name: entry.name,
    neighborhood: entry.neighborhood,
    street_segment: entry.street_segment,
    coordinates: {
      lat: entry.coordinates.lat,
      lng: entry.coordinates.lng
    },
    seed_photo_caption: entry?.photo_reference?.caption || ""
  };
}

function toPublicDataSummary(seed, inatUrl, args, observations, candidates, suggestedLoop) {
  return {
    generated_on: new Date().toISOString(),
    source: {
      provider: "iNaturalist Public API",
      endpoint: inatUrl,
      pull_mode: "api",
      scraping_mode: "none",
      notes: "Exploration-only pull from public API around a seed location"
    },
    seed,
    constraints: {
      search_radius_miles: args.radiusMiles,
      max_walk_miles: args.maxWalkMiles,
      max_stops: args.maxStops,
      recommended_feature: "up to a 2-mile neighborhood nature walk loop"
    },
    ingestion: {
      raw_observations_count: observations.length,
      candidate_count: candidates.length
    },
    suggested_loop: suggestedLoop,
    top_candidates: candidates.slice(0, 25)
  };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

  const dataset = loadDataset(rootDir);
  const seedEntry = dataset.entries.find((entry) => entry.id === args.seedId);

  if (!seedEntry) {
    throw new Error(`Seed entry not found: ${args.seedId}`);
  }

  const seed = buildSeedContext(seedEntry);
  const inatUrl = buildInatObservationsUrl(seed.coordinates, args.radiusMiles, args.perPage);

  const response = await fetch(inatUrl, {
    headers: {
      "User-Agent": "sf-mini-gardens-map/0.1.0 (public-data-exploration)"
    }
  });

  if (!response.ok) {
    throw new Error(`iNaturalist API request failed (${response.status})`);
  }

  const payload = await response.json();
  const observations = payload?.results || [];

  const candidates = buildObservationCandidates(observations, seed.coordinates, args.radiusMiles);
  const suggestedLoop = planLoopWalk(seed.coordinates, candidates, args.maxWalkMiles, args.maxStops);

  const summary = toPublicDataSummary(seed, inatUrl, args, observations, candidates, suggestedLoop);

  const outDir = path.join(rootDir, "data", "exploration");
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, `seed-walk-${seed.entry_id}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`Exploration data written: ${path.relative(rootDir, outPath)}`);
  console.log(`Candidates: ${candidates.length}; Suggested stops: ${suggestedLoop.stop_count}; Loop miles: ${suggestedLoop.total_miles}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
