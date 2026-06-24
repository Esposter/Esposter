import type { DependencyEntry } from "@/checkDependencies/models/DependencyEntry";

import { getPackageJsonPaths } from "@/checkDependencies/getPackageJsonPaths";
import { readFileSync } from "node:fs";

export const getEngineEntries = (root: string): DependencyEntry[] => {
  const entriesByKey = new Map<string, DependencyEntry>();

  for (const manifestPath of getPackageJsonPaths(root)) {
    const manifest: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (!manifest || typeof manifest !== "object") continue;

    const engines: unknown = (manifest as Record<string, unknown>).engines;
    if (!engines || typeof engines !== "object") continue;

    for (const [pkg, specifier] of Object.entries(engines)) {
      if (typeof specifier !== "string") continue;

      entriesByKey.set(`${pkg}@${specifier}`, { group: "engines", pkg, specifier });
    }
  }

  return [...entriesByKey.values()];
};
