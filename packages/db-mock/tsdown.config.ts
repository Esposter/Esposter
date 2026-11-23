import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// `cloudflare-workers` is the stand-in the test runners alias `cloudflare:workers` to. It is its own entry so a suite
// Importing the module the Workers runtime provides loads only `env` and `DurableObject`, not the barrel, whose
// `createMockDatabase` loads Miniflare: every web test file reaches `cloudflare:workers` through the shared setup file,
// And most of them never open a database.
// `workers` is the Workers test doubles, which are typed by the Workers globals and so stay out of the barrel. The entry
// Names their folder, and the build leaves out what a subpath entry names, so the barrel never lists them.
// `cache` is the in-memory Cache Storage two packages' suites share. It is its own entry because the barrel's
// `createMockDatabase` loads Miniflare and `@esposter/db-schema` into any suite that imports it, and that suite would then
// Be held to the Miniflare clock rule. The entry names its file, so the barrel never lists it.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  entry: {
    cache: "src/services/createMockCache.ts",
    "cloudflare-workers": "src/cloudflareWorkers.ts",
    index: "src/index.ts",
    workers: "src/workers/index.ts",
  },
});

export default tsdownConfiguration;
