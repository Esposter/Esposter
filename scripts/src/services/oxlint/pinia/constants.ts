export const DEFINE_STORE_NAME = "defineStore";
export const STORE_TO_REFS_NAME = "storeToRefs";
// The globals a store must not return: each is bound to the page or the app that called it, not to the store
export const GLOBAL_CALLEE_NAMES: ReadonlySet<string> = new Set(["inject", "useRoute"]);
// A store is named `use` followed by its name, so the letter after `use` is the one that starts the store's name
export const STORE_NAME_PREFIX_REGEX: RegExp = /^use[A-Z]/u;
export const DEFAULT_EXPORT_MESSAGE =
  "Never export default initialized store. Use inject/import instead where it is used.";
export const INCORRECT_PREFIX_MESSAGE = 'Store names should start with "use" followed by the store name.';
export const STORE_TO_REFS_MESSAGE = "Do not use storeToRefs in other stores. Use the store as a whole directly.";
export const buildNamedExportMessage = (storeName: string): string =>
  `Never export an initialized store: ${storeName}. Use inject/import instead where it is used.`;
export const buildDuplicateStoreIdMessage = (storeId: string): string => `No duplicated store ids allowed: ${storeId}`;
export const buildGlobalPropertyMessage = (propertyName: string): string =>
  `Do not return properties like ${propertyName} as they are globally available and should not be returned from stores.`;
