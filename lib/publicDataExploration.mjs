const EARTH_RADIUS_MILES = 3958.8;
const MILES_TO_KM = 1.60934;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function milesToKm(miles) {
  return toNumber(miles) * MILES_TO_KM;
}

export function haversineMiles(a, b) {
  const lat1 = toNumber(a.lat);
  const lng1 = toNumber(a.lng);
  const lat2 = toNumber(b.lat);
  const lng2 = toNumber(b.lng);

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const root =
    sinLat * sinLat +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * sinLng * sinLng;

  const arc = 2 * Math.atan2(Math.sqrt(root), Math.sqrt(1 - root));
  return EARTH_RADIUS_MILES * arc;
}

export function normalizeObservation(observation, seedLocation) {
  const coordinates = observation?.geojson?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  const lng = Number(coordinates[0]);
  const lat = Number(coordinates[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const photo = observation?.photos?.[0]?.url || "";
  const photoUrl = String(photo).replace("square", "medium");

  return {
    id: observation.id,
    observed_on: observation.observed_on_string || observation.observed_on || "",
    species_common_name: observation?.taxon?.preferred_common_name || observation?.species_guess || "Unknown",
    species_scientific_name: observation?.taxon?.name || "",
    observation_url: observation.uri || "",
    photo_url: photoUrl,
    coordinates: { lat, lng },
    place_guess: observation.place_guess || "",
    distance_from_seed_miles: Number(haversineMiles(seedLocation, { lat, lng }).toFixed(3))
  };
}

export function buildObservationCandidates(observations, seedLocation, maxRadiusMiles) {
  return (observations || [])
    .map((observation) => normalizeObservation(observation, seedLocation))
    .filter((item) => item !== null)
    .filter((item) => item.distance_from_seed_miles <= maxRadiusMiles)
    .sort((a, b) => a.distance_from_seed_miles - b.distance_from_seed_miles);
}

function nearestFeasible(current, seed, remaining, candidates, usedIds) {
  const sorted = [...candidates]
    .filter((item) => !usedIds.has(item.id))
    .map((item) => {
      const fromCurrent = haversineMiles(current, item.coordinates);
      const returnToSeed = haversineMiles(item.coordinates, seed);
      return {
        item,
        fromCurrent,
        returnToSeed,
        totalNeeded: fromCurrent + returnToSeed
      };
    })
    .sort((a, b) => a.fromCurrent - b.fromCurrent);

  return sorted.find((option) => option.totalNeeded <= remaining) || null;
}

export function planLoopWalk(seedLocation, candidates, maxWalkMiles = 2, maxStops = 4) {
  const usedIds = new Set();
  const stops = [];

  let current = { ...seedLocation };
  let totalMiles = 0;

  while (stops.length < maxStops) {
    const remaining = maxWalkMiles - totalMiles;
    const option = nearestFeasible(current, seedLocation, remaining, candidates, usedIds);

    if (!option) {
      break;
    }

    totalMiles += option.fromCurrent;
    usedIds.add(option.item.id);

    stops.push({
      ...option.item,
      distance_from_previous_miles: Number(option.fromCurrent.toFixed(3))
    });

    current = { ...option.item.coordinates };
  }

  const returnDistance = haversineMiles(current, seedLocation);
  const canReturn = totalMiles + returnDistance <= maxWalkMiles;
  const loopMiles = canReturn ? totalMiles + returnDistance : totalMiles;

  return {
    max_walk_miles: maxWalkMiles,
    total_miles: Number(loopMiles.toFixed(3)),
    return_to_seed_miles: Number((canReturn ? returnDistance : 0).toFixed(3)),
    remaining_miles: Number((maxWalkMiles - loopMiles).toFixed(3)),
    stop_count: stops.length,
    stops
  };
}

export function buildInatObservationsUrl(seedLocation, radiusMiles = 2, perPage = 60) {
  const params = new URLSearchParams({
    lat: String(seedLocation.lat),
    lng: String(seedLocation.lng),
    radius: String(milesToKm(radiusMiles)),
    photos: "true",
    geoprivacy: "open",
    per_page: String(perPage),
    order_by: "created_at",
    order: "desc"
  });

  return `https://api.inaturalist.org/v1/observations?${params.toString()}`;
}
