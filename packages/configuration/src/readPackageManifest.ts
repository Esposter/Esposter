import type { PackageManifest } from "#src/models/PackageManifest";

import { readFileSync } from "node:fs";

// Every build factory reads the manifest of the package being built — tsdown runs with that package as cwd —
// So what a package ships is derived from what it already declares rather than restated in a second place.
export const readPackageManifest = (): PackageManifest =>
  // oxlint-disable-next-line no-restricted-properties -- a package manifest carries no dates, and configuration builds before @esposter/shared so it cannot import jsonDateParse
  JSON.parse(readFileSync("package.json", "utf8")) as PackageManifest;
