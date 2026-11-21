import type { UserConfig } from "tsdown";

import { ExportsGeneration, getTsdownConfiguration } from "@esposter/configuration";

// Written by hand with exportsGeneration "none", because a generated barrel would publish every step and helper the engine
// Is built from, and the package's surface is the entry alone.
const tsdownConfiguration: UserConfig = getTsdownConfiguration({ exportsGeneration: ExportsGeneration.None });

export default tsdownConfiguration;
