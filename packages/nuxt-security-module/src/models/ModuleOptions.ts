import type { AllowedMethodsRestricterOptions } from "#src/models/AllowedMethodsRestricterOptions";
import type { BasicAuthOptions } from "#src/models/BasicAuthOptions";
import type { CorsHandlerOptions } from "#src/models/CorsHandlerOptions";
import type { RateLimiterOptions } from "#src/models/RateLimiterOptions";
import type { RequestSizeLimiterOptions } from "#src/models/RequestSizeLimiterOptions";
import type { SecurityHeaders } from "#src/models/SecurityHeaders";
import type { SsgOptions } from "#src/models/SsgOptions";

export interface ModuleOptions {
  allowedMethodsRestricter: AllowedMethodsRestricterOptions | false;
  basicAuth: BasicAuthOptions | false;
  contentSecurityPolicyReportOnly: boolean;
  corsHandler: CorsHandlerOptions | false;
  // The whole module switched off, which registers no handler, plugin or header
  enabled: boolean;
  headers: false | SecurityHeaders;
  hidePoweredBy: boolean;
  nonce: boolean;
  rateLimiter: false | RateLimiterOptions;
  requestSizeLimiter: false | RequestSizeLimiterOptions;
  sri: boolean;
  ssg: false | SsgOptions;
}
