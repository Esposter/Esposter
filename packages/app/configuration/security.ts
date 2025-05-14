import type { NuxtConfig } from "nuxt/schema";

import { BASE_URL } from "../app/services/desmos/constants";
import { GOOGLE_FONTS_BASE_URL } from "../app/services/google/constants";
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
        "self",
        "data:",
        // Upload file preview
        "blob:",
        "*.googleusercontent.com",
        "https://unpkg.com/emoji-datasource-apple@15.0.1/img/apple/sheets-256/64.png",
        process.env.AZURE_BLOB_URL,
        GRAPESJS_BASE_URL,
        PLACEHOLD_BASE_URL,
        TUI_BASE_URL,
      ],
      "script-src": "'unsafe-eval'",
      // data: @vue-pdf-viewer/viewer
      "script-src-elem": ["'unsafe-inline'", "data:", process.env.BASE_URL, BASE_URL, TUI_BASE_URL],
      "style-src-elem": [
        "'unsafe-inline'",
        "data:",
        process.env.BASE_URL,
        CLOUDFLARE_BASE_URL,
        GOOGLE_FONTS_BASE_URL,
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
