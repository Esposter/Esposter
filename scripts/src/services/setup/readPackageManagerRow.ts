import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupRow } from "#src/models/setup/SetupRow";
import type { PackageManifest } from "@esposter/configuration";

import { VP_ENV_INSTALL_NEXT } from "#src/services/setup/constants";
import { getPackageManagerVersion } from "#src/services/setup/getPackageManagerVersion";
import { getStepRow } from "#src/services/setup/getStepRow";
import { PACKAGE_JSON_FILENAME, PNPM_ARGS, PNPM_FILE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { join } from "node:path";

// The pnpm running this command against the one the root manifest's `packageManager` pins
export const readPackageManagerRow = (environment: SetupEnvironment): SetupRow => {
  const manifest = environment.readText(join(REPOSITORY_ROOT, PACKAGE_JSON_FILENAME)) ?? "{}";
  const pinned = getPackageManagerVersion(parseMachineJson<PackageManifest>(manifest).packageManager);
  const { status, stdout } = environment.run(PNPM_FILE, [...PNPM_ARGS, "--version"]);
  return getStepRow("pnpm", status === 0 && stdout?.trim() === pinned, VP_ENV_INSTALL_NEXT);
};
