import type { SecurityHeaders } from "#src/models/SecurityHeaders";

import { serializeSecurityHeaders } from "#src/runtime/services/serializeSecurityHeaders";

// The headers that apply to every resource, not only to a page.
// A script, a stylesheet or an image the server serves from its public directory carries them as well.
// The page-only policies are left to the rendered page
export const getStaticResourceHeaders = (headers: SecurityHeaders): Record<string, string> =>
  serializeSecurityHeaders({
    referrerPolicy: headers.referrerPolicy,
    strictTransportSecurity: headers.strictTransportSecurity,
    xContentTypeOptions: headers.xContentTypeOptions,
    xDownloadOptions: headers.xDownloadOptions,
    xFrameOptions: headers.xFrameOptions,
    xPermittedCrossDomainPolicies: headers.xPermittedCrossDomainPolicies,
  });
