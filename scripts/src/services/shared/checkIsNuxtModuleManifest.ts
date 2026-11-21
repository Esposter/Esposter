import type { PackageManifest } from "@esposter/configuration";

import { NUXT_KIT_PACKAGE_NAME } from "#src/services/shared/constants";

// A Nuxt module is the package that depends on `@nuxt/kit`, the one rule every check of a package's kind reads
export const checkIsNuxtModuleManifest = (manifest: PackageManifest): boolean =>
  Object.hasOwn(manifest.dependencies ?? {}, NUXT_KIT_PACKAGE_NAME);
