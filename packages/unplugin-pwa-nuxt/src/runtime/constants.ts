export const MODULE_NAME = "unplugin-pwa-nuxt";
// The virtual module a service worker built from source imports its navigation denylist from
export const NAVIGATION_DENYLIST_MODULE: `virtual:${typeof MODULE_NAME}/navigation-denylist` = `virtual:${MODULE_NAME}/navigation-denylist`;
