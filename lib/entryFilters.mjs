function normalize(value) {
  return String(value ?? "").trim();
}

function normalizeKey(value) {
  return normalize(value).toLowerCase();
}

export function buildNeighborhoodOptions(entries) {
  const seen = new Set();
  const options = [];

  for (const entry of entries || []) {
    const neighborhood = normalize(entry?.neighborhood);
    if (!neighborhood) {
      continue;
    }

    const key = normalizeKey(neighborhood);
    if (!seen.has(key)) {
      seen.add(key);
      options.push(neighborhood);
    }
  }

  return options.sort((a, b) => a.localeCompare(b));
}

export function filterEntriesByNeighborhood(entries, selectedNeighborhood) {
  const selected = normalize(selectedNeighborhood);

  if (!selected || normalizeKey(selected) === "all") {
    return [...(entries || [])];
  }

  const selectedKey = normalizeKey(selected);
  return (entries || []).filter((entry) => normalizeKey(entry?.neighborhood) === selectedKey);
}
