import type { InstalledManifest } from "#src/models/dependencies/score/InstalledManifest";
import type { InstalledPackage } from "#src/models/dependencies/score/InstalledPackage";

import { checkIsFile } from "#src/services/dependencies/score/checkIsFile";
import { PACKAGE_JSON_FILENAME } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The installed package in `directory`, or undefined when nothing is installed there
export const readPackageAt = (directory: string): InstalledPackage | undefined => {
  const manifestPath = join(directory, PACKAGE_JSON_FILENAME);
  if (!checkIsFile(manifestPath)) return undefined;

  return { directory, manifest: parseMachineJson<InstalledManifest>(readFileSync(manifestPath, "utf8")) };
};
