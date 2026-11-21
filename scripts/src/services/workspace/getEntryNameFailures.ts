import type { PackageShapeManifest } from "#src/models/workspace/PackageShapeManifest";

import { LIBRARY_ENTRY_PATH, NUXT_MODULE_ENTRY_PATH } from "#src/services/package/new/constants";
import { NUXT_KIT_PACKAGE_NAME } from "#src/services/workspace/constants";

// A package's root entry is `src/index.ts`, and a Nuxt module's is `src/module.ts`, the file Nuxt loads by its own
// Convention. A Nuxt module is the package that depends on `@nuxt/kit` at runtime, which is how its `defineNuxtModule`
// Is reached, so the kind is read off the manifest rather than kept as a list. A package with no `.` export names no
// Root entry, so it has nothing to hold to the rule.
export const getEntryNameFailures = (manifest: PackageShapeManifest): string[] => {
  const entry = manifest.exports?.["."];
  if (entry === undefined) return [];

  const packageName = manifest.name || "(unnamed package)";
  const isNuxtModule = Object.hasOwn(manifest.dependencies ?? {}, NUXT_KIT_PACKAGE_NAME);
  const expectedSource = `./${isNuxtModule ? NUXT_MODULE_ENTRY_PATH : LIBRARY_ENTRY_PATH}`;
  const source = typeof entry === "string" ? undefined : entry.source;
  if (source === expectedSource) return [];

  return [`${packageName} exports "." from ${source ?? "no source arm"}, but its root entry is ${expectedSource}`];
};
