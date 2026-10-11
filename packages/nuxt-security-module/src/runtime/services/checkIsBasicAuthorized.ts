import type { BasicAuthOptions } from "#src/models/BasicAuthOptions";

import { checkIsEqualInConstantTime } from "#src/runtime/services/checkIsEqualInConstantTime";
import { getBasicAuthCredentials } from "#src/runtime/services/getBasicAuthCredentials";

// The request is authorised when its credentials are the configured name and password.
// Each is compared without leaking how much of it matched.
export const checkIsBasicAuthorized = (authorization: string | null, { name, pass }: BasicAuthOptions): boolean => {
  const credentials = getBasicAuthCredentials(authorization);
  return (
    credentials !== undefined &&
    checkIsEqualInConstantTime(credentials.name, name) &&
    checkIsEqualInConstantTime(credentials.pass, pass)
  );
};
