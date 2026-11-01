import type { SecurityHeaders } from "#src/models/SecurityHeaders";

import { SECURITY_HEADER_NAMES } from "#src/runtime/constants";
import { checkIsSecurityHeaderKey } from "#src/runtime/services/checkIsSecurityHeaderKey";
import { serializeValue } from "#src/runtime/services/serializeValue";

// The response header and value of every header that is set.
// A header that is `false` or unset is left out entirely, so `false` never reaches the wire as an empty header
export const serializeSecurityHeaders = (headers: SecurityHeaders): Record<string, string> =>
  Object.fromEntries(
    Object.keys(headers).flatMap((key) => {
      if (!checkIsSecurityHeaderKey(key)) return [];
      const value = headers[key];
      return value === false || value === undefined ? [] : [[SECURITY_HEADER_NAMES[key], serializeValue(key, value)]];
    }),
  );
