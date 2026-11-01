import type { SecurityHeaders } from "#src/models/SecurityHeaders";

import { SECURITY_HEADER_NAMES } from "#src/runtime/constants";

export const checkIsSecurityHeaderKey = (key: string): key is keyof SecurityHeaders =>
  Object.hasOwn(SECURITY_HEADER_NAMES, key);
