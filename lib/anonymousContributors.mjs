const ADJECTIVES = ["Quiet", "Mossy", "Civic", "Foggy", "Kind", "Tender", "Leafy", "Bright"];
const NOUNS = ["Seed", "Walker", "Planter", "Canopy", "Sprout", "Petal", "Branch", "Harbor"];

function hashString(input) {
  let hash = 0;
  for (const char of String(input)) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeAlias(value) {
  return sanitizeAlias(value).toLowerCase();
}

export function sanitizeAlias(alias) {
  const cleaned = normalizeText(alias)
    .replace(/[^a-zA-Z0-9 _-]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 24);
  return cleaned;
}

export function generateAnonymousAlias(seedInput) {
  const seed = hashString(seedInput || Date.now());
  const adjective = ADJECTIVES[seed % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(seed / ADJECTIVES.length) % NOUNS.length];
  return `${adjective} ${noun}`;
}

export function computeTrustTier(contributionCount, verifiedCount) {
  const submitted = Number(contributionCount || 0);
  const verified = Number(verifiedCount || 0);

  if (verified >= 5 || submitted >= 12) {
    return "canopy";
  }
  if (verified >= 2 || submitted >= 4) {
    return "sprout";
  }
  return "seedling";
}

function withTier(profile) {
  return {
    ...profile,
    trust_tier: computeTrustTier(profile.contribution_count, profile.verified_count)
  };
}

export function buildAnonymousProfile(preferredAlias = "", now = new Date()) {
  const alias = sanitizeAlias(preferredAlias) || generateAnonymousAlias(now.toISOString());
  const iso = now.toISOString();
  const token = hashString(`${alias}|${iso}`).toString(36).slice(0, 8);

  return {
    anon_id: `anon-${token}`,
    public_alias: alias,
    privacy_mode: "anonymous",
    joined_on: iso.slice(0, 10),
    contribution_count: 0,
    verified_count: 0,
    trust_tier: "seedling"
  };
}

export function ensureProfileForSubmission(profiles, preferredAlias = "", now = new Date()) {
  const working = Array.isArray(profiles) ? profiles.map((item) => ({ ...item })) : [];
  const preferredKey = normalizeAlias(preferredAlias);

  let profileIndex = -1;
  if (preferredKey) {
    profileIndex = working.findIndex((item) => normalizeAlias(item.public_alias) === preferredKey);
  }

  const created = profileIndex < 0;
  if (created) {
    working.unshift(buildAnonymousProfile(preferredAlias, now));
    profileIndex = 0;
  }

  const selected = {
    ...working[profileIndex],
    contribution_count: Number(working[profileIndex].contribution_count || 0) + 1
  };

  working[profileIndex] = withTier(selected);

  return {
    profiles: working,
    profile: working[profileIndex],
    created
  };
}

export function applyModerationOutcome(profiles, anonId, previousStatus, nextStatus) {
  const working = Array.isArray(profiles) ? profiles.map((item) => ({ ...item })) : [];
  if (!normalizeText(anonId)) {
    return { profiles: working, profile: null };
  }

  const profileIndex = working.findIndex((item) => item.anon_id === anonId);
  if (profileIndex < 0) {
    return { profiles: working, profile: null };
  }

  const profile = { ...working[profileIndex] };
  if (previousStatus !== "verified" && nextStatus === "verified") {
    profile.verified_count = Number(profile.verified_count || 0) + 1;
  }

  working[profileIndex] = withTier(profile);
  return {
    profiles: working,
    profile: working[profileIndex]
  };
}

export function publicContributorSnapshot(profile) {
  return {
    anon_id: profile.anon_id,
    public_alias: profile.public_alias,
    trust_tier: profile.trust_tier,
    privacy_mode: "anonymous"
  };
}
