import { PackageKind } from "#src/models/package/PackageKind";

// A library is built through the platform-agnostic factory, which generates its barrel.
// A nuxt-module is built through the Nuxt factory, which keeps its module an unbundled entry Nuxt loads by path
export const getTsdownSource = (kind: PackageKind): string =>
  kind === PackageKind.NuxtModule
    ? `import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNuxtModule } from "@esposter/configuration";

const tsdownConfiguration: UserConfig = getTsdownConfigurationNuxtModule([]);

export default tsdownConfiguration;
`
    : `import type { UserConfig } from "tsdown";

import { getTsdownConfiguration } from "@esposter/configuration";

const tsdownConfiguration: UserConfig = getTsdownConfiguration();

export default tsdownConfiguration;
`;
