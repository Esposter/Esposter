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
  crossOriginOpenerPolicy?: string | false;
  crossOriginResourcePolicy?: string | false;
  originAgentCluster?: string | false;
  permissionsPolicy?: PermissionsPolicy | false;
  referrerPolicy?: string | false;
  strictTransportSecurity?: false | StrictTransportSecurity;
  xContentTypeOptions?: string | false;
  xDNSPrefetchControl?: string | false;
  xDownloadOptions?: string | false;
  xFrameOptions?: XFrameOptions | false;
  xPermittedCrossDomainPolicies?: string | false;
}
