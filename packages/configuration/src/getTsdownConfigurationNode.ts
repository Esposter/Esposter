import type { UserConfig } from "tsdown";

import { mergeConfig } from "tsdown";

import { getTsdownConfiguration } from "./getTsdownConfiguration.ts";

export const getTsdownConfigurationNode = (): UserConfig => mergeConfig(getTsdownConfiguration(), { platform: "node" });
