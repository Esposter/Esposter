import type { NuxtConfig } from "nuxt/schema";

import { BASE_URL } from "../app/services/desmos/constants";
import { FONTS_BASE_URL } from "../app/services/google/constants";
import {
  BLOGSPOT_BASE_URL,
  CLOUDFLARE_BASE_URL,
  GRAPESJS_BASE_URL,
  MAILJET_BASE_URL,
  PLACEHOLD_BASE_URL,
  TUI_BASE_URL,
  WORDPRESS_DESIGNSPELL_BASE_URL,
} from "../app/services/grapesjs/constants";
import { MAX_FILE_REQUEST_SIZE, MAX_REQUEST_SIZE } from "../shared/services/esposter/constants";

export const security: NuxtConfig["security"] = {
  headers: {
    contentSecurityPolicy: {
      "img-src": [
        // @vite-pwa/nuxt
        "'self'",
        // phaser, surveyjs
        "data:",
        // Upload file createObjectURL preview
        "blob:",
        // Google user image
        "*.googleusercontent.com",
        // emoji-mart-vue-fast
        "https://unpkg.com/emoji-datasource-apple@15.0.1/img/apple/sheets-256/64.png",
        // Azure
        process.env.AZURE_BLOB_URL,
        // grapesjs
        BLOGSPOT_BASE_URL,
        // grapesjs
        GRAPESJS_BASE_URL,
        // grapesjs
        MAILJET_BASE_URL,
        // grapesjs
        PLACEHOLD_BASE_URL,
        // grapesjs
        TUI_BASE_URL,
        // grapesjs
        WORDPRESS_DESIGNSPELL_BASE_URL,
      ],
      // desmos
      "script-src": "'unsafe-eval'",
      "script-src-elem": [
        // nuxt data hydration
        "'unsafe-inline'",
        // nuxt vite client
        "'self'",
        // @vue-pdf-viewer/viewer
        "data:",
        // desmos
        BASE_URL,
        // grapesjs
        TUI_BASE_URL,
      ],
      "style-src-elem": [
        // vuetify
        "'unsafe-inline'",
        // nuxt
        "'self'",
        // grapesjs
        CLOUDFLARE_BASE_URL,
        // @nuxt/fonts
        FONTS_BASE_URL,
        // grapesjs
        TUI_BASE_URL,
      ],
      "worker-src": [
        // pdfjs-dist
        "'self'",
        // desmos
        "blob:",
      ],
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
