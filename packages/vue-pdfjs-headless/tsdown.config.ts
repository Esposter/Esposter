import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// `xfdf` is the XFDF exchange alone, so a consumer that only reads or writes XFDF loads none of the viewer
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfiguration(), {
  entry: { index: "src/index.ts", xfdf: "src/xfdf/index.ts" },
});

export default tsdownConfiguration;
