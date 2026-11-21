import type { UserConfig } from "tsdown";

import { ExportsGeneration, getTsdownConfiguration } from "@esposter/configuration";

// The API is the one file that names what a consumer imports, so the build writes no barrel: every module with an
// Export would otherwise be public, and the reader's services with them.
const tsdownConfiguration: UserConfig = getTsdownConfiguration({ exportsGeneration: ExportsGeneration.None });

export default tsdownConfiguration;
