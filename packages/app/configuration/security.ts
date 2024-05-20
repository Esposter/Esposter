import { env } from "@/env.client";
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
        env.NUXT_PUBLIC_AZURE_BLOB_URL,
      ],
      "script-src-attr": ["'unsafe-inline'"],
    },
    crossOriginEmbedderPolicy: "unsafe-none",
  },
};
