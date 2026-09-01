import type { ExportsGeneration } from "#src/models/ExportsGeneration";

import { CTIX_TS_CONFIGURATION, CTIX_VUE_CONFIGURATION } from "#src/constants";
import { getSourceFingerprint } from "#src/getSourceFingerprint";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const CtixConfigurationsMap: Record<ExportsGeneration, string[]> = {
  none: [],
  typescript: [CTIX_TS_CONFIGURATION],
  vue: [CTIX_VUE_CONFIGURATION, CTIX_TS_CONFIGURATION],
};
// The ctix configs live beside this package's own source, and both arms of its `exports` map sit one directory
// Below the package root — `src` under the source condition, `dist` under the default one — so the same
// Relative step reaches them however a consumer resolved this module.
const CONFIGURATION_DIRECTORY = resolve(import.meta.dirname, "..");
// What tsdown resolves its entry to, so a package missing it has to generate whatever its fingerprint says.
const GENERATED_BARREL = "src/index.ts";
const FINGERPRINT_FILE = "node_modules/.cache/ctix-source-fingerprint";
// Resolved rather than spawned by name: a bare `ctix` would be found through whatever `PATH` the process
// Happened to inherit, which is the package manager's doing and not this package's to rely on.
const getCtixCommandPath = (): string => {
  const ctixCommandPath = resolve(dirname(createRequire(import.meta.url).resolve("ctix")), "cli.cjs");

  if (!existsSync(ctixCommandPath)) throw new Error(`ctix's cli is not at the expected path: ${ctixCommandPath}`);
  return ctixCommandPath;
};

// Runs ctix over the package tsdown is currently building, as a `build:prepare` hook rather than as a step in
// Every package's `build` script — one definition instead of a line repeated per manifest, and the one place
// A guard can live. `export:gen` stays a script of its own for the manual, unconditional regeneration.
//
// The guard is worth more than it looks. Generation is a full TypeScript program per package and costs seconds
// Each, which is most of what a package build spends once declarations are out of it, and it earns none of that
// On the ordinary edit that changes a file's contents without adding or removing one.
//
// Stdio is inherited, so ctix reports what it wrote exactly as it did when a script invoked it.
export const generateExports = (exportsGeneration: ExportsGeneration): void => {
  const ctixConfigurations = CtixConfigurationsMap[exportsGeneration];
  if (ctixConfigurations.length === 0) return;

  const fingerprint = getSourceFingerprint();
  const isFingerprintCurrent = existsSync(FINGERPRINT_FILE) && readFileSync(FINGERPRINT_FILE, "utf8") === fingerprint;
  if (isFingerprintCurrent && existsSync(GENERATED_BARREL)) return;

  const ctixCommandPath = getCtixCommandPath();
  for (const ctixConfiguration of ctixConfigurations) {
    const { status } = spawnSync(
      process.execPath,
      [ctixCommandPath, "build", "--config", resolve(CONFIGURATION_DIRECTORY, ctixConfiguration)],
      { stdio: "inherit" },
    );
    // A stale barrel is a build that succeeds against the wrong export surface, so this fails the build rather
    // Than leaving tsdown to bundle whatever the last successful run happened to write.

    if (status !== 0) throw new Error(`ctix exited ${String(status)} for ${ctixConfiguration}`);
  }

  mkdirSync(dirname(FINGERPRINT_FILE), { recursive: true });
  writeFileSync(FINGERPRINT_FILE, fingerprint);
};
