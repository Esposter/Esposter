import type { ContentSecurityPolicy } from "#src/models/ContentSecurityPolicy";
import type { PermissionsPolicy } from "#src/models/PermissionsPolicy";
import type { StrictTransportSecurity } from "#src/models/StrictTransportSecurity";

import { serializeContentSecurityPolicy } from "#src/runtime/services/serializeContentSecurityPolicy";
import { serializePermissionsPolicy } from "#src/runtime/services/serializePermissionsPolicy";
import { serializeStrictTransportSecurity } from "#src/runtime/services/serializeStrictTransportSecurity";

export const serializeValue = (key: string, value: unknown): string => {
  if (key === "contentSecurityPolicy") return serializeContentSecurityPolicy(value as ContentSecurityPolicy);
  if (key === "permissionsPolicy") return serializePermissionsPolicy(value as PermissionsPolicy);
  if (key === "strictTransportSecurity") return serializeStrictTransportSecurity(value as StrictTransportSecurity);
  return String(value);
};
