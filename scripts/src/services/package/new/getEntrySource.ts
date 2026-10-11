import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { toCamelCase } from "#src/services/package/new/toCamelCase";

// A nuxt-module's entry is its `defineNuxtModule`, which the app loads by its source path. Any other kind's is one
// exported constant, so the file compiles, is picked up by the barrel and gives the build something to bundle
export const getEntrySource = (options: CreatePackageOptions): string => {
  const { description, kind, name } = options;
  if (kind === PackageKind.NuxtModule)
    return `import { defineNuxtModule } from "@nuxt/kit";

export default defineNuxtModule({
  meta: { name: ${JSON.stringify(name)} },
  setup() {},
});
`;
  return `export const ${toCamelCase(name)}Description: string = ${JSON.stringify(description)};
`;
};
