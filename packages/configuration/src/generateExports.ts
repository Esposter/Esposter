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

// The one definition of how a barrel is generated, and both ways of generating one go through it: the
// `build:prepare` hook `getTsdownConfiguration` registers, so no manifest repeats the command in front of its
// Build, and the `generate-exports` bin, so `export:gen` regenerates a barrel without paying for the
// Bundle, the declarations and the publish gates behind it — which is the whole of what a typecheck needs after
// A file is added. The config paths and the order the "vue" answer runs them in are named here and nowhere else.
//
// The default sits on the parameter rather than at either call site, because the bin's argument is a command
// Line: `process.argv[2]` is absent for every package but the one shipping components. The membership check is
// There for the same reason — an unknown answer reaches this typed parameter anyway, and reading the map blind
// Would fail as a TypeError naming this file rather than the argument that was wrong.
//
// Generation is unguarded on purpose. A barrel of `export * from` names no symbol and so looks like a function
// Of the source file list, cheap to hash and skip on — and it is not one: ctix resolves two files exporting the
// Same identifier by dropping both, so a rename that collides changes the output while moving no path. Nothing
// Cheap is a sound key for it, and nothing needs to be. CI restores `dist` and the barrels together from the
// `package-builds` cache on an exact content hash, which is the case that actually happens; a build that misses
// That cache is regenerating everything regardless.
//
// Stdio is inherited, so ctix reports what it wrote exactly as it did when a script invoked it.
export const generateExports = (exportsGeneration: ExportsGeneration = "typescript"): void => {
  if (!(exportsGeneration in CtixConfigurationsMap))
    throw new Error(
      `${exportsGeneration} is not an exports generation: expected one of ${Object.keys(CtixConfigurationsMap).join(", ")}`,
    );

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
