import type { NuxtConfig } from "nuxt/schema";

export const security: NuxtConfig["security"] = {
  corsHandler: {
    origin: [process.env.AZURE_BLOB_URL],
  },
  csrf: true,
  headers: {
    contentSecurityPolicy: {
      "img-src": ["'self'", "data:", "blob:"],
      "script-src-attr": ["'unsafe-inline'"],
    },
  },
};
