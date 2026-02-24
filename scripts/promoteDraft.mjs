import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { promoteDraftToDataset } from "../lib/promoteDraft.mjs";
import { validateDataset } from "./validateMiniGardens.mjs";

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const next = argv[i + 1];

    if (key === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (key.startsWith("--") && next && !next.startsWith("--")) {
      args[key.slice(2)] = next;
      i += 1;
    }
  }

  return args;
}

function required(args, key) {
  if (!args[key]) {
    throw new Error(`Missing required argument --${key}`);
  }
  return args[key];
}

function runCli() {
  const args = parseArgs(process.argv.slice(2));

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const datasetPath = path.resolve(root, args.dataset || "data/mini-gardens.json");
  const draftPath = path.resolve(root, required(args, "draft"));

  const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
  const draft = JSON.parse(fs.readFileSync(draftPath, "utf8"));

  const updated = promoteDraftToDataset(dataset, draft, {
    lat: required(args, "lat"),
    lng: required(args, "lng"),
    verifier: args.verifier,
    verifiedOn: args["verified-on"],
    lastUpdated: args["last-updated"]
  });

  const validationErrors = validateDataset(updated);
  if (validationErrors.length > 0) {
    throw new Error(`Promotion produced invalid dataset:\n${validationErrors.map((e) => `- ${e}`).join("\n")}`);
  }

  if (!args.dryRun) {
    fs.writeFileSync(datasetPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  }

  const promoted = updated.entries[updated.entries.length - 1];
  console.log(`Promoted draft ${draft.id} -> ${promoted.id}`);
  console.log(`Dataset entries: ${updated.entries.length}`);
  if (args.dryRun) {
    console.log("Dry run only: dataset was not modified.");
  }
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  try {
    runCli();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
