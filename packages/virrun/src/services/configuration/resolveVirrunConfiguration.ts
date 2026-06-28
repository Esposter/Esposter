import type { VirrunConfiguration } from "@/models/virrun/VirrunConfiguration";

import { parseVirrunConfiguration } from "@/services/configuration/parseVirrunConfiguration";
import { VIRRUN_CONFIGURATION_FILENAME } from "@/services/exec/util/constants";
import { resolveCwd } from "@/services/exec/util/resolveCwd";
import { file } from "empathic/find";
import { readFileSync } from "node:fs";
// Walks up from cwd to the first `virrun.config.json` (the repo root in a monorepo) via empathic's standard
// Parent-directory file search, then parses it. Returns undefined when no config exists anywhere up the tree —
// A fully valid state: the backend resolver then defaults to Auto (native today), so a prefixed command runs
// Exactly as if no config were present. A present-but-malformed config throws (via the parser) so a typo fails
// Loud instead of silently changing the backend.
export const resolveVirrunConfiguration = (cwd = ""): undefined | VirrunConfiguration => {
  const configurationFile = file(VIRRUN_CONFIGURATION_FILENAME, { cwd: resolveCwd(cwd) });
  if (configurationFile === undefined) return undefined;
  else return parseVirrunConfiguration(readFileSync(configurationFile, "utf8"));
};
