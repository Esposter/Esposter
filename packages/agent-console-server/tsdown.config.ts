import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";
// `contracts` is the wire alone — Zod schemas and constants, nothing that reaches node — so the page can import
// It; `cli` is what the bin runs
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  entry: { cli: "src/cli.ts", contracts: "src/contracts.ts", index: "src/index.ts" },
});

export default tsdownConfiguration;
