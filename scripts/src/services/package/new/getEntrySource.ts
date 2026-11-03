import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { toCamelCase } from "#src/services/package/new/toCamelCase";

// A nuxt-module's entry is its `defineNuxtModule`, which the app loads by its source path. It is typed by annotation,
// since `isolatedDeclarations` cannot infer a default export's type from a call. Any other kind's is one exported
// constant, so the file compiles, is picked up by the barrel and gives the build something to bundle
export const getEntrySource = (options: CreatePackageOptions): string => {
  const { description, kind, name } = options;
  if (kind === PackageKind.NuxtModule)
    return `import type { NuxtModule } from "@nuxt/schema";

import { defineNuxtModule } from "@nuxt/kit";

// oxlint-disable-next-line typescript/no-empty-object-type -- empty until the module declares its options
export interface ModuleOptions {}

const ${toCamelCase(name)}: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: { name: ${JSON.stringify(name)} },
  setup() {},
});

export default ${toCamelCase(name)};
`;
  return `export const ${toCamelCase(name)}Description: string = ${JSON.stringify(description)};
`;
};
