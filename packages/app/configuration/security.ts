import type { NuxtConfig } from "nuxt/schema";

import { BASE_URL } from "../app/services/desmos/constants";
import { FONTS_BASE_URL } from "../app/services/google/constants";
import {
  CLOUDFLARE_BASE_URL,
  GRAPESJS_BASE_URL,
  PLACEHOLD_BASE_URL,
  TUI_BASE_URL,
} from "../app/services/grapesjs/constants";
import { MAX_FILE_REQUEST_SIZE, MAX_REQUEST_SIZE } from "../shared/services/esposter/constants";

export const security: NuxtConfig["security"] = {
  headers: {
    // @TODO: Document what packages need what policies...
    contentSecurityPolicy: {
      "img-src": [
        // @vite-pwa/nuxt
        "'self'",
        "data:",
        // Upload file preview
        "blob:",
        // Google user image
        "*.googleusercontent.com",
        // emoji-mart-vue-fast
        "https://unpkg.com/emoji-datasource-apple@15.0.1/img/apple/sheets-256/64.png",
        // Azure
        process.env.AZURE_BLOB_URL,
        // grapesjs
        GRAPESJS_BASE_URL,
        // grapesjs
        PLACEHOLD_BASE_URL,
        // grapesjs
        TUI_BASE_URL,
      ],
      // desmos
      "script-src": "'unsafe-eval'",
      "script-src-elem": [
        // nuxt data hydration
        "'unsafe-inline'",
        // @vue-pdf-viewer/viewer
        "data:",
        process.env.BASE_URL,
        BASE_URL,
        // grapesjs
        TUI_BASE_URL,
      ],
      "style-src-elem": [
        // vuetify
        "'unsafe-inline'",
        "data:",
        process.env.BASE_URL,
        // grapesjs
        CLOUDFLARE_BASE_URL,
        // @nuxt/fonts
        FONTS_BASE_URL,
        // grapesjs
        TUI_BASE_URL,
      ],
      "worker-src": ["blob:", process.env.BASE_URL],
    },
    permissionsPolicy: {
      // @vue-pdf-viewer/viewer
      fullscreen: "self",
    },
  },
  rateLimiter: false,
  requestSizeLimiter: {
    maxRequestSizeInBytes: MAX_REQUEST_SIZE,
    maxUploadFileRequestInBytes: MAX_FILE_REQUEST_SIZE,
  },
  // @TODO: https://github.com/wobsoriano/trpc-nuxt/issues/215
  xssValidator: false,
};
