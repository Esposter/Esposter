import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// `contracts` is the wire alone — Zod schemas and constants, nothing that reaches node — so the page can import
// It; `cli` is what the bin runs. It is built but not exported: importing the program would run it, and the bin
// Loads `dist/cli.js` by path
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  entry: { cli: "src/cli.ts", contracts: "src/contracts.ts", index: "src/index.ts" },
  exports: { exclude: ["cli"] },
});

export default tsdownConfiguration;
