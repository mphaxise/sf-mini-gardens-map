import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateDataset } from "../scripts/validateMiniGardens.mjs";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const datasetPath = path.resolve(currentDir, "..", "data", "mini-gardens.json");
const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));

test("seed dataset passes validation", () => {
  const errors = validateDataset(dataset);
  assert.deepEqual(errors, []);
});

test("seed dataset includes Jarboe pilot corridor", () => {
  const pilot = dataset.entries.find((entry) => entry.id === "sf-jarboe-ellsworth-gates-001");
  assert.ok(pilot, "expected seeded Jarboe pilot entry");
  assert.equal(pilot.street_segment.street_name, "Jarboe St");
  assert.equal(pilot.street_segment.from_street, "Ellsworth St");
  assert.equal(pilot.street_segment.to_street, "Gates St");
  assert.equal(pilot.status, "verified");
});

test("seed dataset includes second verified Bernal Heights workflow sample", () => {
  const second = dataset.entries.find((entry) => entry.id === "sf-folsom-nevada-powhattan-001");
  assert.ok(second, "expected second verified workflow sample entry");
  assert.equal(second.neighborhood, "Bernal Heights");
  assert.equal(second.street_segment.street_name, "Folsom St");
  assert.equal(second.status, "verified");
});

test("seed dataset now has at least two verified entries", () => {
  const verifiedCount = dataset.entries.filter((entry) => entry.status === "verified").length;
  assert.ok(verifiedCount >= 2, `expected >=2 verified entries, got ${verifiedCount}`);
});

test("validation rejects out-of-range coordinates", () => {
  const bad = JSON.parse(JSON.stringify(dataset));
  bad.entries[0].coordinates.lat = 40;
  const errors = validateDataset(bad);
  assert.ok(errors.some((err) => err.includes("San Francisco bounding box")));
});
