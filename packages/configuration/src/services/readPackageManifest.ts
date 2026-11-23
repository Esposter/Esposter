import type { PackageManifest } from "#src/models/PackageManifest";

import { packageManifestSchema } from "#src/models/PackageManifest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Every build factory reads the manifest of the package being built — tsdown runs with that package as cwd —
// So what a package ships is derived from what it already declares rather than restated in a second place.
// The file is parsed by its schema, so a field of the wrong type fails the read rather than the build behind it
export const readPackageManifest = (packageDirectory = "."): PackageManifest =>
  // A package manifest carries no dates, and configuration builds before @esposter/shared so it cannot import
  // `jsonDateParse`;
  // oxlint-disable-next-line no-restricted-properties -- the manifest is the repo's own file, which npm wrote
  packageManifestSchema.parse(JSON.parse(readFileSync(join(packageDirectory, "package.json"), "utf8")));
