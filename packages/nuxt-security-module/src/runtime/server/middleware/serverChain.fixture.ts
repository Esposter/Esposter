import type { ModuleOptions } from "#src/models/ModuleOptions";

// The app's security options as its configuration file states them. Its environment-derived origins are placeholders of
// the same shape, so the bench reads the same directive counts without the app's environment. Only the options that
// decide the server chain and the route rules it matches are here. The rest take the module's defaults
export const APP_SECURITY_OPTIONS: Partial<ModuleOptions> = {
  headers: {
    contentSecurityPolicy: {
      "img-src": [
        "'self'",
        "data:",
        "blob:",
        "*.githubusercontent.com",
        "*.googleusercontent.com",
        "https://storage.placeholder.invalid",
        "https://images.placeholder.invalid",
      ],
      "script-src": ["'unsafe-eval'"],
      "script-src-elem": [
        "'unsafe-inline'",
        "'self'",
        "data:",
        "https://scripts.placeholder.invalid",
        "https://tui.placeholder.invalid",
        "https://mediapipe.placeholder.invalid",
      ],
      "style-src-elem": ["'unsafe-inline'", "'self'", "https://styles.placeholder.invalid"],
      "worker-src": ["'self'", "blob:"],
      "connect-src": [
        "'self'",
        "https://storage.placeholder.invalid",
        "https://livekit.placeholder.invalid",
        "wss://*.webpubsub.placeholder.invalid",
        "https://cdn.placeholder.invalid",
      ],
      "media-src": ["'self'", "https://storage.placeholder.invalid", "blob:"],
    },
    permissionsPolicy: { camera: ["self"], "display-capture": ["self"], fullscreen: ["self"], microphone: ["self"] },
  },
  rateLimiter: false,
  requestSizeLimiter: { maxRequestSizeInBytes: 2_000_000, maxUploadFileRequestInBytes: 10_000_000 },
};

// The same app with most features off: only the request size limit stays on, so a chain of one handler is measured
export const MINIMAL_SECURITY_OPTIONS: Partial<ModuleOptions> = {
  allowedMethodsRestricter: false,
  basicAuth: false,
  corsHandler: false,
  csrf: false,
  rateLimiter: false,
  requestSizeLimiter: { maxRequestSizeInBytes: 2_000_000, maxUploadFileRequestInBytes: 10_000_000 },
};
