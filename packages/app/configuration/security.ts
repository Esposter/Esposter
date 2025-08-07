import type { NuxtConfig } from "nuxt/schema";

import { BASE_URL } from "../app/services/desmos/constants";
import { FONTS_BASE_URL } from "../app/services/google/constants";
import { MAX_FILE_REQUEST_SIZE, MAX_REQUEST_SIZE } from "../shared/services/esposter/constants";
import { ImageSourceWhitelist } from "../shared/services/esposter/ImageSourceWhitelist";
import { CLOUDFLARE_BASE_URL, TUI_BASE_URL } from "../shared/services/grapesjs/constants";

export const security: NuxtConfig["security"] = {
  headers: {
    contentSecurityPolicy: {
      "img-src": ImageSourceWhitelist,
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
