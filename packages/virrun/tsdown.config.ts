import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";
// Self-contained CLI/library bundle: everything it uses is a devDependency, which tsdown bundles, so consumers
// Install it with zero peers to manage. `unconfig` is the one runtime dependency and stays external — its
// Synchronous TS loading does `createRequire(import.meta.url)("jiti")` relative to its own installed file, so
// Vendoring would rebase that lookup and break config loading in consumer repos. The base derives its
// `onlyImport` gate from that same lone dependency, which makes "self-contained" checkable rather than asserted.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  // `config` is the tiny `virrun/config` subpath entry (defineConfig only). A `virrun.config.ts` importing the
  // Main barrel makes jiti transpile the whole bundle on every `virrun -- <cmd>`, and unconfig disables jiti's
  // Fs cache, so that costs roughly 25x what loading this module does — seconds per invocation, not
  // Milliseconds.
  entry: { cli: "src/cli.ts", config: "src/services/configuration/defineConfig.ts", index: "src/index.ts" },
});

export default tsdownConfiguration;
