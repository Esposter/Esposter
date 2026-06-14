import type { ManifestDependency } from "@/checkDependencies/models/ManifestDependency";

import { getPackageJsonPaths } from "@/checkDependencies/getPackageJsonPaths";
import { readFileSync } from "node:fs";

const dependencyFields = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"] as const;

export const getManifestDependencies = (root: string): ManifestDependency[] => {
  const manifestDependencies: ManifestDependency[] = [];

  for (const manifestPath of getPackageJsonPaths(root)) {
    const manifest: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (!manifest || typeof manifest !== "object") continue;

    const manifestName = (manifest as Record<string, unknown>).name;
    if (typeof manifestName !== "string") continue;

    for (const field of dependencyFields) {
      const dependencies: unknown = (manifest as Record<string, unknown>)[field];
      if (!dependencies || typeof dependencies !== "object") continue;

      for (const [pkg, specifier] of Object.entries(dependencies)) {
        if (typeof specifier !== "string") continue;

        manifestDependencies.push({ field, manifestName, manifestPath, pkg, specifier });
      }
    }
  }

  return manifestDependencies;
};
