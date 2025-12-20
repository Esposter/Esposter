import type { NuxtConfig } from "nuxt/schema";

import { BASE_URL } from "../app/services/desmos/constants";
import { FONTS_BASE_URL } from "../app/services/google/constants";
import { MAX_FILE_REQUEST_SIZE, MAX_REQUEST_SIZE } from "../shared/services/app/constants";
import { ImageSourceWhitelist } from "../shared/services/app/ImageSourceWhitelist";
import { CLOUDFLARE_BASE_URL, TUI_BASE_URL } from "../shared/services/grapesjs/constants";

export const security: NuxtConfig["security"] = {
  headers: {
    contentSecurityPolicy: {
      "img-src": ImageSourceWhitelist,
      // Desmos
      "script-src": "'unsafe-eval'",
      "script-src-elem": [
        // Nuxt data hydration
        "'unsafe-inline'",
        // Nuxt vite client
        "'self'",
        // @vue-pdf-viewer/viewer
        "data:",
        // Desmos
        BASE_URL,
        // Grapesjs
        TUI_BASE_URL,
      ],
      "style-src-elem": [
        // Vuetify
        "'unsafe-inline'",
        // Nuxt
        "'self'",
        // Grapesjs
        CLOUDFLARE_BASE_URL,
        // @nuxt/fonts
        FONTS_BASE_URL,
        // Grapesjs
        TUI_BASE_URL,
      ],
      "worker-src": [
        // Pdfjs-dist
        "'self'",
        // Desmos
        "blob:",
      ],
    },
    permissionsPolicy: {
      // @vue-pdf-viewer/viewer
      fullscreen: "self",
      microphone: "self",
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
