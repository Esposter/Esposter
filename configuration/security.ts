import type { NuxtConfig } from "nuxt/schema";

export const security: NuxtConfig["security"] = {
  csrf: true,
  headers: {
    contentSecurityPolicy: {
      "img-src": ["'self'", "data:", "blob:", "*.googleusercontent.com", process.env.AZURE_BLOB_URL],
      "script-src-attr": ["'unsafe-inline'"],
    },
    crossOriginEmbedderPolicy: "unsafe-none",
  },
};
