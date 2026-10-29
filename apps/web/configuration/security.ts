import type { NuxtConfig } from "nuxt/schema";

import { createHash } from "node:crypto";

import { BASE_URL } from "../app/services/desmos/constants.ts";
import { MEDIAPIPE_TASKS_VISION_URL } from "../app/services/message/room/liveKit/constants.ts";
import { MAX_FILE_REQUEST_SIZE, MAX_REQUEST_SIZE } from "../shared/services/app/constants.ts";
import { NUXT_IMAGE_ERROR_HANDLER } from "./constants.ts";

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
        // LiveKit: the signalling socket, and the HTTPS form of its host that its region lookup fetches
        process.env.LIVEKIT_URL,
        process.env.LIVEKIT_URL?.replace(/^wss:/u, "https:"),
        // Azure Web PubSub: the WebSocket its client access URL names
        "wss://*.webpubsub.azure.com",
        // `@livekit/track-processors`: the wasm its segmenter fetches, and the segmenter model
        "https://cdn.jsdelivr.net",
        "https://storage.googleapis.com",
        // An unset env var, as in CI, leaves its host out: the security module refuses an undefined source
      ].filter((source) => source !== undefined),
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
        // Nuxt data hydration
        "'unsafe-inline'",
        // Nuxt vite client
        "'self'",
        // Desmos
        BASE_URL,
        // @livekit/track-processors
        MEDIAPIPE_TASKS_VISION_URL,
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
      // `livekit-client`
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
  },
  rateLimiter: false,
  requestSizeLimiter: { maxRequestSizeInBytes: MAX_REQUEST_SIZE, maxUploadFileRequestInBytes: MAX_FILE_REQUEST_SIZE },
  // The module has no XSS validator: its filter rejects ordinary text a message carries, and passes a script once
  // `escapeHtml` is off. Rich text is sanitised at its Zod boundary instead
};
