// Cover Pop — hand-in entrypoint.
//
// The cover maker itself lives in app/: plain static files (index.html plus
// ES modules, no libraries, no network calls) that a desktop browser loads
// offline. This file is only the delivery step. It stages a copy of app/ and
// screenshots/ into the grader's output directory and writes dossier.json,
// the summary the scorer reads.
//
// To try it outside the grader container:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// then look at out/dossier.json. Inside the container the output directory
// defaults to /output.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

// Folder holding this file, and the folder the hand-in goes into.
const sourceRoot = fileURLToPath(new URL(".", import.meta.url));
const outputRoot = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Copy one directory tree over another, creating the target first.
function stageTree(fromDir: string, toDir: string): void {
  fs.mkdirSync(toDir, { recursive: true });
  fs.cpSync(fromDir, toDir, { recursive: true });
}

// Limits taken from the scorer's reference/gate.json. Only text_max_bytes
// changes the dossier bytes; the rest mirror refusals the scorer would make:
// at most four screenshots, none larger than 256 KiB; at most 993 files
// inside app/, 48 MiB in total, and no app/ path longer than 1000 bytes.
// (app/ is counted next to the output's own 1000-entry cap, its
// screenshots/ folder, and dossier.json.)
const dossierCaps = {
  text_max_bytes: 160 * 1024,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function handIn(): void {
  fs.mkdirSync(outputRoot, { recursive: true });

  stageTree(path.join(sourceRoot, "app"), path.join(outputRoot, "app"));

  const shotsTarget = path.join(outputRoot, "screenshots");
  fs.mkdirSync(shotsTarget, { recursive: true });
  const shotsSource = path.join(sourceRoot, "screenshots");
  if (fs.existsSync(shotsSource)) {
    fs.cpSync(shotsSource, shotsTarget, { recursive: true });
  }

  const dossier = buildDossier(outputRoot, dossierCaps);
  fs.writeFileSync(path.join(outputRoot, "dossier.json"), dossier);
}

handIn();
