import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// `cloudflare-workers` is the stand-in the test runners alias `cloudflare:workers` to. It is its own entry so a suite
// Importing the module the Workers runtime provides loads only `env` and `DurableObject`, not the barrel, whose
// `createMockDatabase` loads Miniflare: every web test file reaches `cloudflare:workers` through the shared setup file,
// And most of them never open a database.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  entry: { "cloudflare-workers": "src/cloudflareWorkers.ts", index: "src/index.ts" },
});

export default tsdownConfiguration;
