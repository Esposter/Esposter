import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "#src/getTsdownConfiguration";
import { mergeConfig } from "tsdown";

export const getTsdownConfigurationNode = (): UserConfig => mergeConfig(getTsdownConfiguration(), { platform: "node" });
