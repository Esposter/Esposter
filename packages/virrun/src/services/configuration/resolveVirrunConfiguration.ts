import type { VirrunConfiguration } from "@/models/virrun/VirrunConfiguration";

import { parseVirrunConfiguration } from "@/services/configuration/parseVirrunConfiguration";
import { VIRRUN_CONFIGURATION_FILENAME } from "@/services/exec/util/constants";
import { resolveCwd } from "@/services/exec/util/resolveCwd";
import { file } from "empathic/find";
import { readFileSync } from "node:fs";
// Walks up from cwd to the first `virrun.config.json`, then parses it. Undefined when none exists anywhere up the
// Tree is a valid state — the backend resolver defaults to Auto. A present-but-malformed config throws (via the
// Parser) so a typo fails loud instead of silently changing the backend.
export const resolveVirrunConfiguration = (cwd = ""): undefined | VirrunConfiguration => {
  const configurationFile = file(VIRRUN_CONFIGURATION_FILENAME, { cwd: resolveCwd(cwd) });
  if (configurationFile === undefined) return undefined;
  else return parseVirrunConfiguration(readFileSync(configurationFile, "utf8"));
};
