import type { ExportsGeneration } from "#src/models/ExportsGeneration";

import { CTIX_TS_CONFIGURATION, CTIX_VUE_CONFIGURATION } from "#src/constants";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
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
// Resolved rather than spawned by name: a bare `ctix` would be found through whatever `PATH` the process
// Happened to inherit, which is the package manager's doing and not this package's to rely on.
const getCtixCommandPath = (): string => {
  const ctixCommandPath = resolve(dirname(createRequire(import.meta.url).resolve("ctix")), "cli.cjs");

  if (!existsSync(ctixCommandPath)) throw new Error(`ctix's cli is not at the expected path: ${ctixCommandPath}`);
  return ctixCommandPath;
};

// Runs ctix over the package tsdown is currently building, as a `build:prepare` hook rather than as a step in
// Every package's `build` script — one definition instead of a line repeated per manifest. `export:gen` stays a
// Script of its own for regenerating without a build.
//
// Unguarded on purpose. A barrel of `export * from` names no symbol and so looks like a function of the source
// File list, cheap to hash and skip on — and it is not one: ctix resolves two files exporting the same
// Identifier by dropping both, so a rename that collides changes the output while moving no path. Nothing cheap
// Is a sound key for it, and nothing needs to be. CI restores `dist` and the barrels together from the
// `package-builds` cache on an exact content hash, which is the case that actually happens; a build that misses
// That cache is regenerating everything regardless.
//
// Stdio is inherited, so ctix reports what it wrote exactly as it did when a script invoked it.
export const generateExports = (exportsGeneration: ExportsGeneration): void => {
  const ctixConfigurations = CtixConfigurationsMap[exportsGeneration];
  if (ctixConfigurations.length === 0) return;

  const ctixCommandPath = getCtixCommandPath();

  for (const ctixConfiguration of ctixConfigurations) {
    const ctixConfigurationPath = resolve(CONFIGURATION_DIRECTORY, ctixConfiguration);
    const { status } = spawnSync(process.execPath, [ctixCommandPath, "build", "--config", ctixConfigurationPath], {
      stdio: "inherit",
    });
    // A stale barrel is a build that succeeds against the wrong export surface, so this fails the build rather
    // Than leaving tsdown to bundle whatever the last successful run happened to write.
    if (status !== 0) throw new Error(`ctix exited ${String(status)} for ${ctixConfigurationPath}`);
  }
};
