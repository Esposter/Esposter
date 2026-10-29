import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";
import type { SetupOptions } from "#src/models/setup/SetupOptions";
import type { SetupRow } from "#src/models/setup/SetupRow";

import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { SETUP_LOGINS, SETUP_TOOLS } from "#src/services/setup/constants";
import { readDataRow } from "#src/services/setup/readDataRow";
import { readDependenciesRow } from "#src/services/setup/readDependenciesRow";
import { readGameRow } from "#src/services/setup/readGameRow";
import { readHooksRow } from "#src/services/setup/readHooksRow";
import { readLoginRow } from "#src/services/setup/readLoginRow";
import { readMemoryRow } from "#src/services/setup/readMemoryRow";
import { readNodeRow } from "#src/services/setup/readNodeRow";
import { readPackageManagerRow } from "#src/services/setup/readPackageManagerRow";
import { readReferencesRow } from "#src/services/setup/readReferencesRow";
import { readRootRow } from "#src/services/setup/readRootRow";
import { readToolRow } from "#src/services/setup/readToolRow";
import { readWindowsRows } from "#src/services/setup/readWindowsRows";
import { CACHE_ROOT } from "@esposter/shared-node/cache";

// Every step of the new-machine setup, in the order a person takes them, one row each
export const readSetupRows = (
  options: SetupOptions,
  environment: SetupEnvironment,
  platform: NodeJS.Platform,
): SetupRow[] => [
  readNodeRow(environment),
  readPackageManagerRow(environment),
  readDependenciesRow(options, environment),
  readHooksRow(environment),
  ...SETUP_TOOLS.map((tool) => readToolRow(tool, environment, platform)),
  ...SETUP_LOGINS.map((login) => readLoginRow(login, environment)),
  ...readWindowsRows(environment, platform),
  readRootRow("parity folder", PARITY_DIRECTORY, environment),
  readRootRow("download cache", CACHE_ROOT, environment),
  readGameRow(environment),
  readDataRow(options, environment),
  readReferencesRow(options, environment),
  readMemoryRow(environment),
];
