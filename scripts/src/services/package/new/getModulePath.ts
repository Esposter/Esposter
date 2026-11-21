import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { NUXT_MODULE_ENTRY_PATH } from "#src/services/package/new/constants";
import { toCamelCase } from "#src/services/package/new/toCamelCase";

// The source file the generator writes. A Nuxt module's is its entry. A library's is one module named for the package,
// Which the build's barrel lists beside whatever the package adds
export const getModulePath = ({ kind, name }: CreatePackageOptions): string =>
  kind === PackageKind.NuxtModule ? NUXT_MODULE_ENTRY_PATH : `src/${toCamelCase(name)}.ts`;
