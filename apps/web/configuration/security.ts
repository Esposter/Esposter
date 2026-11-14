import type { NuxtConfig } from "nuxt/schema";

import { createHash } from "node:crypto";

import { BASE_URL } from "../app/services/desmos/constants.ts";
import { MAX_REQUEST_SIZE } from "../shared/services/app/constants.ts";
import { NUXT_IMAGE_ERROR_HANDLER, REALTIME_ASSETS_URL } from "./constants.ts";

export const security: NuxtConfig["security"] = {
  headers: {
    contentSecurityPolicy: {
      // Setting a fetch directive replaces its `default-src` fallback, so `'self'` is listed here for the app's
      // Own tRPC and Nitro routes
      "connect-src": [
        "'self'",
        // The Gem's glTF carries its buffers as base64 data URIs, which three.js fetches the same way it fetches a URL
        "data:",
        // Three.js GLTFLoader: embedded texture sources become blob URLs before they are fetched
        "blob:",
        // Azure Blob: the upload's SAS PUTs and the reads of the game data the world fetches
        process.env.AZURE_CONTAINER_BASE_URL,
        // RealtimeKit: its REST and signalling API, and the virtual background's models at its asset host
        "https://*.realtime.cloudflare.com",
        "wss://*.realtime.cloudflare.com",
        // An unset env var, as in CI, leaves its host out: the security module refuses an undefined source
      ].filter((source) => source !== undefined),
      // No page frames the app: its own frames are `srcdoc` documents, which no response header governs
      "frame-ancestors": ["'none'"],
      // Members embed images from anywhere on the web, in a message or a resource's page or email, and no allowlist
      // Can enumerate it. One policy for every route: the app navigates on the client, so the document a session
      // Landed on carries its policy to every page it opens after
      "img-src": ["'self'", "data:", "blob:", "https:"],
      // Audio and video messages play from Azure Blob, and an uploaded file's preview plays from its `blob:` URL
      "media-src": ["'self'", process.env.AZURE_CONTAINER_BASE_URL, "blob:"].filter((source) => source !== undefined),
      // Desmos
      "script-src": ["'unsafe-eval'"],
      // An event handler attribute runs only when its hash is listed under 'unsafe-hashes', and the one handler allowed is
      // `NuxtImg`'s error marker, so every other inline handler stays blocked
      "script-src-attr": [
        "'unsafe-hashes'",
        `'sha256-${createHash("sha256").update(NUXT_IMAGE_ERROR_HANDLER).digest("base64")}'`,
      ],
      "script-src-elem": [
        // Nuxt data hydration, and the inline scripts a published page's sandboxed srcdoc iframe carries, which inherits
        // This policy and has no nonce of the response to carry
        "'unsafe-inline'",
        // Nuxt vite client
        "'self'",
        // Desmos
        BASE_URL,
        // RealtimeKit's virtual background loads its wasm glue from its assets host
        REALTIME_ASSETS_URL,
      ],
      "style-src-elem": [
        // The component styles Nuxt inlines into the page
        "'unsafe-inline'",
        // Nuxt
        "'self'",
      ],
      "worker-src": [
        // `pdfjs-dist`
        "'self'",
        // Desmos
        "blob:",
      ],
    },
    // The module denies every powerful feature by default, so each one the app calls is opened here by name
    permissionsPolicy: {
      // The Genshin world's music, the game sounds and the call's media, each a `play()`
      autoplay: ["self"],
      // The call's camera
      camera: ["self"],
      // The sheet's paste
      "clipboard-read": ["self"],
      // Every copy button, the sheet's copy and a resource's link
      "clipboard-write": ["self"],
      "display-capture": ["self"],
      // The call view's stage, which `requestFullscreen`s its own element
      fullscreen: ["self"],
      // The Genshin world's controller input, `navigator.getGamepads`
      gamepad: ["self"],
      microphone: ["self"],
    },
    // The header form of `frame-ancestors`, for a browser that reads only the older one
    xFrameOptions: "DENY",
  },
  rateLimiter: false,
  // No route takes a larger body, since files travel to Blob Storage by SAS. Any route that takes one
  // Names its own limit in a route rule
  requestSizeLimiter: { maxRequestSizeInBytes: MAX_REQUEST_SIZE },
  // The module has no XSS validator: its filter rejects ordinary text a message carries, and passes a script once
  // `escapeHtml` is off. Rich text is sanitised at its Zod boundary instead
};
