import type { ContentSecurityPolicy } from "#src/models/ContentSecurityPolicy";
import type { PermissionsPolicy } from "#src/models/PermissionsPolicy";
import type { SecurityHeaders } from "#src/models/SecurityHeaders";
import type { StrictTransportSecurity } from "#src/models/StrictTransportSecurity";

import { SECURITY_HEADER_NAMES } from "#src/runtime/constants";
import { serializeContentSecurityPolicy } from "#src/runtime/services/serializeContentSecurityPolicy";
import { serializePermissionsPolicy } from "#src/runtime/services/serializePermissionsPolicy";
import { serializeStrictTransportSecurity } from "#src/runtime/services/serializeStrictTransportSecurity";

// The response header and value of every header that is set.
// A header that is `false` or unset is left out entirely, so `false` never reaches the wire as an empty header
export const serializeSecurityHeaders = (headers: SecurityHeaders): Record<string, string> =>
  Object.fromEntries(
    Object.entries(SECURITY_HEADER_NAMES).flatMap(([key, name]) => {
      const value = headers[key];
      return value === false || value === undefined ? [] : [[name, serializeValue(key, value)]];
    }),
  );

const serializeValue = (key: string, value: unknown): string => {
  if (key === "contentSecurityPolicy") return serializeContentSecurityPolicy(value as ContentSecurityPolicy);
  if (key === "permissionsPolicy") return serializePermissionsPolicy(value as PermissionsPolicy);
  if (key === "strictTransportSecurity") return serializeStrictTransportSecurity(value as StrictTransportSecurity);
  return String(value);
};
