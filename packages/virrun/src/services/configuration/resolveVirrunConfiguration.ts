import type { VirrunConfiguration } from "#src/models/virrun/VirrunConfiguration";

import { parseVirrunConfiguration } from "#src/services/configuration/parseVirrunConfiguration";
import { VIRRUN_CONFIGURATION_EXTENSIONS, VIRRUN_CONFIGURATION_NAME } from "#src/services/exec/util/constants";
import { resolveCwd } from "#src/services/exec/util/resolveCwd";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { loadConfigSync } from "unconfig";
// Walks up from cwd to the first `virrun.config.{ts,mts,js,mjs,json}` (nearest directory wins; within a directory the
// Candidate order prefers TS — the platform-branching form — over the JSON variant) and loads it via unconfig, whose
// Sync path imports TS/JS through jiti and strict-`JSON.parse`s the JSON variant. Undefined when none exists anywhere
// Up the tree is a valid state — the backend resolver defaults to os. A present-but-unloadable config (e.g. a TS
// Syntax error) rethrows as InvalidOperationError and a well-formed-but-invalid one throws via the parser, so a typo
// Fails loud instead of silently changing the backend.
export const resolveVirrunConfiguration = (cwd = ""): undefined | VirrunConfiguration =>
  getResult(() =>
    loadConfigSync<unknown>({
      cwd: resolveCwd(cwd),
      sources: { extensions: [...VIRRUN_CONFIGURATION_EXTENSIONS], files: VIRRUN_CONFIGURATION_NAME },
    }),
  ).match(
    ({ config, sources }) => (sources.length === 0 ? undefined : parseVirrunConfiguration(config)),
    (error) => {
      throw new InvalidOperationError(Operation.Read, resolveVirrunConfiguration.name, error.message);
    },
  );
