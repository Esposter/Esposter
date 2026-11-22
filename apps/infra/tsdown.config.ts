import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// A program, not a library: Pulumi runs `dist/index.js` once and nothing imports it, so there is no consumer's bundler
// To prune the output, and one file is the program's shape.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), { unbundle: false });

export default tsdownConfiguration;
