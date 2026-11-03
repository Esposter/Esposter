import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNuxtModule } from "@esposter/configuration";

// No runtime file is excluded from `exports` yet: the package has no runtime
const tsdownConfiguration: UserConfig = getTsdownConfigurationNuxtModule([]);

export default tsdownConfiguration;
