import type { BackendType } from "#src/models/virrun/BackendType";
import type { Environment } from "#src/models/virrun/Environment";

import { Color } from "#src/models/cli/Color";
import { colorize } from "#src/services/cli/color/colorize";
import { formatVirrunLine } from "#src/services/cli/format/formatVirrunLine";
import { buildVirrunConfigurationContent } from "#src/services/configuration/buildVirrunConfigurationContent";
import { VIRRUN_CONFIGURATION_FILENAME } from "#src/services/exec/util/constants";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Refuses to clobber an existing config unless forced, so a re-run never silently rewrites a committed choice.
export const writeInitConfiguration = (
  backend: BackendType,
  environment: Environment | undefined,
  isForced: boolean,
): void => {
  const path = join(process.cwd(), VIRRUN_CONFIGURATION_FILENAME);
  if (existsSync(path) && !isForced) {
    process.stderr.write(
      `${formatVirrunLine(`${colorize(VIRRUN_CONFIGURATION_FILENAME, Color.Blue)} already exists (use ${colorize("--force", Color.Yellow)} to overwrite)`)}\n`,
    );
    process.exitCode = 1;
    return;
  }
  writeFileSync(path, buildVirrunConfigurationContent(backend, environment));
  process.stderr.write(
    `${formatVirrunLine(`wrote ${colorize(path, Color.Blue)} (backend=${colorize(backend, Color.Blue)}, environment=${colorize(environment ?? "none", Color.Blue)})`)}\n`,
  );
};
