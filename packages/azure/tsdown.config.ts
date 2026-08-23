import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfiguration(), {
  exports: { devExports: true },
});

export default tsdownConfiguration;
