import type { SecurityHeaders } from "#src/models/SecurityHeaders";

import { CrossOriginEmbedderPolicy } from "#src/models/CrossOriginEmbedderPolicy";
import { XFrameOptions } from "#src/models/XFrameOptions";
import { NONCE_PLACEHOLDER } from "#src/runtime/constants";

// Each reviewed default has its source in the defaults review page,
// `apps/web/content/docs/nuxt-security-module/defaults-review.md`.
// The `Permissions-Policy` denials are OWASP's `ci/headers_add.json`, and the HSTS `max-age` is OWASP's two-year value
export const getDefaultSecurityHeaders = (isDevelopment: boolean): SecurityHeaders => ({
  contentSecurityPolicy: {
    "base-uri": ["'none'"],
    "default-src": ["'self'"],
    "font-src": ["'self'", "https:", "data:"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
    "img-src": ["'self'", "data:"],
    "object-src": ["'none'"],
    "script-src": ["'self'", "https:", "'unsafe-inline'", "'strict-dynamic'", NONCE_PLACEHOLDER],
    "script-src-attr": ["'none'"],
    "style-src": ["'self'", "https:", "'unsafe-inline'"],
    "upgrade-insecure-requests": true,
  },
  // The `require-corp` value OWASP recommends would block the third-party scripts the app loads.
  // Unless each sends a `Cross-Origin-Resource-Policy` header, so `credentialless` stays.
  crossOriginEmbedderPolicy: isDevelopment
    ? CrossOriginEmbedderPolicy.UnsafeNone
    : CrossOriginEmbedderPolicy.Credentialless,
  crossOriginOpenerPolicy: "same-origin",
  crossOriginResourcePolicy: "same-origin",
  originAgentCluster: "?1",
  permissionsPolicy: {
    accelerometer: [],
    autoplay: [],
    camera: [],
    "clipboard-read": [],
    "clipboard-write": [],
    "cross-origin-isolated": [],
    "display-capture": [],
    "encrypted-media": [],
    fullscreen: [],
    gamepad: [],
    geolocation: [],
    gyroscope: [],
    hid: [],
    "idle-detection": [],
    "interest-cohort": [],
    "keyboard-map": [],
    magnetometer: [],
    microphone: [],
    midi: [],
    payment: [],
    "picture-in-picture": [],
    "publickey-credentials-get": [],
    "screen-wake-lock": [],
    serial: [],
    "sync-xhr": ["self"],
    unload: [],
    usb: [],
    "web-share": [],
    "xr-spatial-tracking": [],
  },
  referrerPolicy: "no-referrer",
  strictTransportSecurity: { includeSubdomains: true, maxAge: 63072000, preload: false },
  xContentTypeOptions: "nosniff",
  xDNSPrefetchControl: "off",
  xDownloadOptions: "noopen",
  xFrameOptions: XFrameOptions.SameOrigin,
  xPermittedCrossDomainPolicies: "none",
});
