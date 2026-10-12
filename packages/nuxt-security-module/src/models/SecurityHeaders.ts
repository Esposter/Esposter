import type { ContentSecurityPolicy } from "#src/models/ContentSecurityPolicy";
import type { CrossOriginEmbedderPolicy } from "#src/models/CrossOriginEmbedderPolicy";
import type { PermissionsPolicy } from "#src/models/PermissionsPolicy";
import type { StrictTransportSecurity } from "#src/models/StrictTransportSecurity";
import type { XFrameOptions } from "#src/models/XFrameOptions";

// Every header the module sets.
// `false` leaves the header out of the response, and a header sent as a string is the value as written
export interface SecurityHeaders {
  contentSecurityPolicy?: ContentSecurityPolicy | false;
  crossOriginEmbedderPolicy?: CrossOriginEmbedderPolicy | false;
  crossOriginOpenerPolicy?: false | string;
  crossOriginResourcePolicy?: false | string;
  originAgentCluster?: false | string;
  permissionsPolicy?: false | PermissionsPolicy;
  referrerPolicy?: false | string;
  strictTransportSecurity?: false | StrictTransportSecurity;
  xContentTypeOptions?: false | string;
  xDNSPrefetchControl?: false | string;
  xDownloadOptions?: false | string;
  xFrameOptions?: false | XFrameOptions;
  xPermittedCrossDomainPolicies?: false | string;
}
