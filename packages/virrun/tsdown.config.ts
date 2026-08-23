import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";
// Self-contained CLI/library bundle: everything it uses is a devDependency, which tsdown bundles, so consumers
// `npm i virrun` with zero peers to manage. The one runtime dependency is `unconfig` (which loads
// Virrun.config.{ts,mts,js,mjs,json}): its synchronous TS loading does `createRequire(import.meta.url)("jiti")`
// Relative to its own installed file, so vendoring it would rebase that resolution and break config loading in
// Consumer repos. The base config derives its `onlyImport` gate from that same lone dependency, which is what
// Makes "self-contained" checkable rather than asserted — the build fails if a chunk imports anything else.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  // `config` is the tiny `virrun/config` subpath entry (defineConfig only): a `virrun.config.ts` importing the
  // Main barrel would make jiti transpile the whole bundle on every `virrun -- <cmd>` (unconfig disables
  // Jiti's fs cache — measured ~11 s per invocation), so config files import this ~1 kB module instead.
  entry: { cli: "src/cli.ts", config: "src/services/configuration/defineConfig.ts", index: "src/index.ts" },
});

export default tsdownConfiguration;
