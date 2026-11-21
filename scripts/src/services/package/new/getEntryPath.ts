import type { CreatePackageOptions } from "#src/models/package/CreatePackageOptions";

import { PackageKind } from "#src/models/package/PackageKind";
import { LIBRARY_ENTRY_PATH, NUXT_MODULE_ENTRY_PATH } from "#src/services/package/new/constants";

// The root entry the manifest's `.` export names. A library's is the barrel its build writes from the modules beside it,
// So no file the generator writes takes that name
export const getEntryPath = ({ kind }: CreatePackageOptions): string =>
  kind === PackageKind.NuxtModule ? NUXT_MODULE_ENTRY_PATH : LIBRARY_ENTRY_PATH;
