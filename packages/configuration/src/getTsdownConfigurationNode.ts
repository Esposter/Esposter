import type { TsdownConfigurationOptions } from "#src/models/TsdownConfigurationOptions";
import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "#src/getTsdownConfiguration";
import { mergeConfig } from "tsdown";

export const getTsdownConfigurationNode = (options?: TsdownConfigurationOptions): UserConfig =>
  mergeConfig(getTsdownConfiguration(options), { platform: "node" });
