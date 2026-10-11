import type { BasicAuthOptions } from "#src/models/BasicAuthOptions";

import { checkIsEqualInConstantTime } from "#src/runtime/services/checkIsEqualInConstantTime";
import { getBasicAuthCredentials } from "#src/runtime/services/getBasicAuthCredentials";

// The request is authorised when its credentials are the configured name and password.
// Each is compared without leaking how much of it matched, and both are always compared, so the time taken does not
// Show whether the name alone was right
export const checkIsBasicAuthorized = (authorization: null | string, { name, pass }: BasicAuthOptions): boolean => {
  const credentials = getBasicAuthCredentials(authorization);
  if (!credentials) return false;

  const isNameEqual = checkIsEqualInConstantTime(credentials.name, name);
  const isPassEqual = checkIsEqualInConstantTime(credentials.pass, pass);
  return isNameEqual && isPassEqual;
};
