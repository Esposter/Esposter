import type { NuxtConfig } from "nuxt/schema";

export const experimental: NuxtConfig["experimental"] = {
  // Top-level await marks a component async, making props evaluate to undefined and triggering
  // `[Vue warn]: Invalid prop: type check failed`; asyncContext fixes that.
  asyncContext: true,
  // @TODO: https://github.com/nuxt/nuxt/issues/36136
  // Under the entry import map a chunk imports `#entry`, so its hash never covers the entry's, yet Vite writes the
  // Entry's hashed name into the chunk's preload list after hashing: one file name ships different bytes across
  // Deploys, and an immutable cached copy then fails its subresource integrity check and the page never boots
  entryImportMap: false,
  typescriptPlugin: true,
};
