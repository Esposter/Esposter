import type { NuxtConfig } from "nuxt/schema";

import { BASE_URL } from "../services/desmos/constants";
import { CLOUDFLARE_BASE_URL, TUI_BASE_URL } from "../services/grapesjs/constants";

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
        TUI_BASE_URL,
      ],
      "script-src": "'unsafe-eval'",
      "script-src-elem": ["'unsafe-inline'", process.env.BASE_URL, BASE_URL, TUI_BASE_URL],
      "style-src-elem": ["'unsafe-inline'", "data:", process.env.BASE_URL, TUI_BASE_URL, CLOUDFLARE_BASE_URL],
      "worker-src": ["blob:", process.env.BASE_URL],
    },
  },
};
