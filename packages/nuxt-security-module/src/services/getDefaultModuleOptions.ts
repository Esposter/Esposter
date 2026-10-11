import type { ModuleOptions } from "#src/models/ModuleOptions";

import { getDefaultSecurityHeaders } from "#src/services/getDefaultSecurityHeaders";

// Every option a consumer leaves unset.
// The CORS origin is the development server's own, never a wildcard.
// So a consumer's page is not readable by any other origin.
export const getDefaultModuleOptions = (
  isDevelopment: boolean,
  devServerUrl: string,
  isStrict: boolean,
): ModuleOptions => ({
  allowedMethodsRestricter: false,
  basicAuth: false,
  csrf: false,
  contentSecurityPolicyReportOnly: false,
  corsHandler: {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: devServerUrl,
    preflight: { statusCode: 204 },
  },
  enabled: true,
  headers: getDefaultSecurityHeaders(isDevelopment, isStrict),
  hidePoweredBy: true,
  nonce: true,
  rateLimiter: false,
  requestSizeLimiter: { maxRequestSizeInBytes: 2_000_000, maxUploadFileRequestInBytes: 8_000_000 },
  sri: true,
  strict: isStrict,
  ssg: { exportToPresets: true, hashScripts: true, hashStyles: false, meta: true, nitroHeaders: true },
});
