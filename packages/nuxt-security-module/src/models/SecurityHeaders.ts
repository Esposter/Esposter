import type { ContentSecurityPolicy } from "#src/models/ContentSecurityPolicy";
import type { CrossOriginEmbedderPolicy } from "#src/models/CrossOriginEmbedderPolicy";
import type { PermissionsPolicy } from "#src/models/PermissionsPolicy";
import type { StrictTransportSecurity } from "#src/models/StrictTransportSecurity";
import type { XFrameOptions } from "#src/models/XFrameOptions";

// Every header the module sets.
// `false` leaves the header out of the response, and a header sent as a string is the value as written
export interface SecurityHeaders {
  contentSecurityPolicy?: ContentSecurityPolicy | false | undefined;
  crossOriginEmbedderPolicy?: CrossOriginEmbedderPolicy | false | undefined;
  crossOriginOpenerPolicy?: false | string | undefined;
  crossOriginResourcePolicy?: false | string | undefined;
  originAgentCluster?: false | string | undefined;
  permissionsPolicy?: false | PermissionsPolicy | undefined;
  referrerPolicy?: false | string | undefined;
  strictTransportSecurity?: false | StrictTransportSecurity | undefined;
  xContentTypeOptions?: false | string | undefined;
  xDNSPrefetchControl?: false | string | undefined;
  xFrameOptions?: false | undefined | XFrameOptions;
  xPermittedCrossDomainPolicies?: false | string | undefined;
}
