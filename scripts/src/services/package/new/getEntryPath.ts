import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { NUXT_MODULE_ENTRY_PATH } from "#src/services/package/new/constants";
import { toCamelCase } from "#src/services/package/new/toCamelCase";

// The source file the package's exports point at. A library's barrel is generated from its source by the build, so the package's own file is only the first of them.
// That file is named for the package
export const getEntryPath = ({ kind, name }: CreatePackageOptions): string =>
  kind === PackageKind.NuxtModule ? NUXT_MODULE_ENTRY_PATH : `src/${toCamelCase(name)}.ts`;
