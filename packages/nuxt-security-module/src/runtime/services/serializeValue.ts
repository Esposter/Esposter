/* oxlint-disable typescript/no-unsafe-type-assertion -- the key picks which policy the value is, and TypeScript cannot tie a value's type to a key read from a separate parameter, so each policy's value is asserted to the type its key names */
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
