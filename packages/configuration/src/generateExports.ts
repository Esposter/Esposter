import type { ExportsGeneration } from "#src/models/ExportsGeneration";

import { CTIX_TS_CONFIGURATION, CTIX_VUE_CONFIGURATION } from "#src/constants";
import { getSourceFingerprint } from "#src/getSourceFingerprint";
import { getTsconfigPaths } from "#src/getTsconfigPaths";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const CtixConfigurationsMap: Record<ExportsGeneration, string[]> = {
  none: [],
  typescript: [CTIX_TS_CONFIGURATION],
  vue: [CTIX_VUE_CONFIGURATION, CTIX_TS_CONFIGURATION],
};
// What each ctix pass above writes, in the same order, and the `.gitignore` entries that keep them out of the
// Repository are the same two paths. Named exactly rather than matched by shape: every other `index.ts` under
// `src` is a hand-written directory barrel that the root barrel carries a line for, so treating one as
// Generated both skips regenerating a barrel that is missing a line and hides the file from the fingerprint.
const GeneratedBarrelsMap: Record<ExportsGeneration, string[]> = {
  none: [],
  typescript: ["src/index.ts"],
  vue: ["src/components/index.ts", "src/index.ts"],
};
// The ctix configs live beside this package's own source, and both arms of its `exports` map sit one directory
// Below the package root — `src` under the source condition, `dist` under the default one — so the same
// Relative step reaches them however a consumer resolved this module.
const CONFIGURATION_DIRECTORY = resolve(import.meta.dirname, "..");
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
// The cli is resolved ahead of the fingerprint rather than after it, because it is one of the fingerprint's own
// Inputs — the generator is part of what the barrel is a function of.
//
// Stdio is inherited, so ctix reports what it wrote exactly as it did when a script invoked it.
export const generateExports = (exportsGeneration: ExportsGeneration): void => {
  const ctixConfigurations = CtixConfigurationsMap[exportsGeneration];
  if (ctixConfigurations.length === 0) return;

  const ctixCommandPath = getCtixCommandPath();
  const ctixConfigurationPaths = ctixConfigurations.map((ctixConfiguration) =>
    resolve(CONFIGURATION_DIRECTORY, ctixConfiguration),
  );
  const generatedBarrelPaths = GeneratedBarrelsMap[exportsGeneration];
  // The tsconfig every `.ctirc-*` points `project` at, and every preset it extends. Its `include` and `exclude`
  // Decide which files ctix ever sees, so it is as much a generator input as ctix itself — left out, widening a
  // Shared preset's exclude list changes what the barrel should hold while the fingerprint reports nothing to do,
  // And the package builds green against an export surface that no longer matches its source.
  const fingerprint = getSourceFingerprint(generatedBarrelPaths, [
    ctixCommandPath,
    ...ctixConfigurationPaths,
    ...getTsconfigPaths(process.cwd(), CONFIGURATION_DIRECTORY),
  ]);
  const isFingerprintCurrent = existsSync(FINGERPRINT_FILE) && readFileSync(FINGERPRINT_FILE, "utf8") === fingerprint;
  // Every barrel the passes below write, not just the one tsdown resolves its entry to: the component barrel is
  // Reached through the root one, so a package missing it builds against a root barrel whose line points at
  // Nothing while the fingerprint still says there is nothing to do.
  if (isFingerprintCurrent && generatedBarrelPaths.every((generatedBarrelPath) => existsSync(generatedBarrelPath)))
    return;

  for (const ctixConfigurationPath of ctixConfigurationPaths) {
    const { status } = spawnSync(process.execPath, [ctixCommandPath, "build", "--config", ctixConfigurationPath], {
      stdio: "inherit",
    });
    // A stale barrel is a build that succeeds against the wrong export surface, so this fails the build rather
    // Than leaving tsdown to bundle whatever the last successful run happened to write.
    if (status !== 0) throw new Error(`ctix exited ${String(status)} for ${ctixConfigurationPath}`);
  }

  mkdirSync(dirname(FINGERPRINT_FILE), { recursive: true });
  writeFileSync(FINGERPRINT_FILE, fingerprint);
};
