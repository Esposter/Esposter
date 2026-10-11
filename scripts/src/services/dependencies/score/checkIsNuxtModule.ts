import { NUXT_MODULE_PREFIXES, NUXT_PACKAGE_NAME } from "#src/services/dependencies/score/constants";

// A Nuxt module is loaded from the app's configuration, so the source that imports it is never its runtime
export const checkIsNuxtModule = (packageName: string): boolean =>
  packageName === NUXT_PACKAGE_NAME || NUXT_MODULE_PREFIXES.some((prefix) => packageName.startsWith(prefix));
