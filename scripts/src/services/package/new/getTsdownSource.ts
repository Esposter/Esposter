import { PackageKind } from "#src/models/package/PackageKind";

// A library is built through the platform-agnostic factory, which generates its barrel.
// A nuxt-module is built unbundled beside its one source file, since Nuxt loads the module by path.
// Its imports of Nuxt itself are not evaluated by the build
export const getTsdownSource = (kind: PackageKind): string =>
  kind === PackageKind.NuxtModule
    ? `import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode({ exportsGeneration: "none" }), {
  entry: [{ index: "src/module.ts" }],
});

export default tsdownConfiguration;
`
    : `import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "@esposter/configuration";

const tsdownConfiguration: UserConfig = getTsdownConfiguration();

export default tsdownConfiguration;
`;
