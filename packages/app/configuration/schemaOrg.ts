import type { NuxtConfig } from "nuxt/schema";

export const schemaOrg: NuxtConfig["schemaOrg"] = {
  // @TODO: Remove once Nuxt SEO's schema.org defaults work with Nuxt's resolved Unhead versions.
  defaults: false,
};
