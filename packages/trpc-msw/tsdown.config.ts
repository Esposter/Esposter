import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";

const tsdownConfiguration: UserConfig = getTsdownConfigurationNode();

export default tsdownConfiguration;
