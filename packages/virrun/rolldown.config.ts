import type { RolldownOptions } from "rolldown";

import { getRolldownConfigurationNode } from "@esposter/configuration";
// Two entrypoints: the library barrel (index) and the CLI binary (cli).
const rolldownConfigurationNode: RolldownOptions = {
  ...getRolldownConfigurationNode(),
  // Self-contained CLI/library bundle: vendor everything (incl. @esposter/*, zod, @platformatic/vfs
  // And the vue framework peers) so consumers `npm i virrun` with zero peer deps to manage. The harmless
  // @vueuse/core INVALID_ANNOTATION ("comment ignored due to position") parse warnings are tolerated —
  // The alternative (externalizing vue) would force consumers to install peer deps. The one exception is
  // Unconfig (the runtime dependency loading virrun.config.{ts,mts,js,mjs,json}): its synchronous TS loading
  // Does `createRequire(import.meta.url)("jiti")` at runtime relative to its own installed file, so vendoring
  // It would rebase that resolution into the bundle and break config loading in consumer repos.
  external: ["unconfig"],
  // `config` is the tiny `virrun/config` subpath entry (defineConfig only): a `virrun.config.ts` importing the main
  // Barrel would make jiti transpile the whole ~1 MB bundle on every `virrun -- <cmd>` (unconfig disables jiti's fs
  // Cache — measured ~11 s per invocation), so config files import this ~1 kB module instead.
  input: { cli: "src/cli.ts", config: "src/services/configuration/defineConfig.ts", index: "src/index.ts" },
};

export default rolldownConfigurationNode;
