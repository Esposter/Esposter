import type { NuxtConfig } from "nuxt/schema";

export const security: NuxtConfig["security"] = {
  headers: {
    contentSecurityPolicy: {
      "img-src": [
        "'self'",
        "data:",
        "blob:",
        "*.googleusercontent.com",
        "https://unpkg.com/emoji-datasource-apple@15.0.1/img/apple/sheets-256/64.png",
        process.env.AZURE_BLOB_URL,
      ],
      "script-src": "'unsafe-eval'",
      "script-src-elem": ["'unsafe-inline'", process.env.BASE_URL],
      "worker-src": "blob:",
    },
    crossOriginEmbedderPolicy: "unsafe-none",
  },
};
