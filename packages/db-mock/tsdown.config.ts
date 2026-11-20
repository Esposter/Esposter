import type { UserConfig } from "tsdown";

import { ExportsGeneration, generateExports, getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// `cloudflare-workers` is the stand-in the test runners alias `cloudflare:workers` to. It is its own entry so a suite
// Importing the module the Workers runtime provides loads only `env` and `DurableObject`, not the barrel, whose
// `createMockDatabase` loads Miniflare: every web test file reaches `cloudflare:workers` through the shared setup file,
// And most of them never open a database.
// `workers` is the Workers test doubles, which are typed by the Workers globals and so stay out of the barrel. The
// Barrel leaves their folder out, since nothing in the repo imports the doubles from it, and the entry names them.
const WORKERS_DIRECTORY = "workers";
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  entry: { "cloudflare-workers": "src/cloudflareWorkers.ts", index: "src/index.ts", workers: "src/workers/index.ts" },
  hooks: {
    // The hook replaces the base's rather than joining it, so it writes the barrel the base writes, with the folder left out
    "build:prepare": ({ options: { cwd } }) => {
      generateExports(cwd, ExportsGeneration.TypeScript, [WORKERS_DIRECTORY]);
    },
  },
});

export default tsdownConfiguration;
