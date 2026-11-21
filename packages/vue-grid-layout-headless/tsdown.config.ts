import type { UserConfig } from "tsdown";

import { ExportsGeneration, getTsdownConfiguration } from "@esposter/configuration";

// Written by hand with exportsGeneration "none", because a generated barrel would publish the internal registry of
// Mounted grids and the constants.
const tsdownConfiguration: UserConfig = getTsdownConfiguration({ exportsGeneration: ExportsGeneration.None });

export default tsdownConfiguration;
