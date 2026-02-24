import assert from "node:assert/strict";
import test from "node:test";

import { buildNeighborhoodOptions, filterEntriesByNeighborhood } from "../lib/entryFilters.mjs";

const sampleEntries = [
  { id: "1", neighborhood: "Excelsior" },
  { id: "2", neighborhood: "Bernal Heights" },
  { id: "3", neighborhood: "excelsior" },
  { id: "4", neighborhood: "" }
];

test("buildNeighborhoodOptions returns unique sorted neighborhood names", () => {
  const options = buildNeighborhoodOptions(sampleEntries);
  assert.deepEqual(options, ["Bernal Heights", "Excelsior"]);
});

test("filterEntriesByNeighborhood returns all entries when all selected", () => {
  const filtered = filterEntriesByNeighborhood(sampleEntries, "all");
  assert.equal(filtered.length, sampleEntries.length);
});

test("filterEntriesByNeighborhood matches neighborhood case-insensitively", () => {
  const filtered = filterEntriesByNeighborhood(sampleEntries, "EXCELSIOR");
  assert.equal(filtered.length, 2);
  assert.deepEqual(
    filtered.map((entry) => entry.id),
    ["1", "3"]
  );
});
