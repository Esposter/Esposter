import type { IdMap } from "#src/models/cutover/IdMap";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The stored hash a bearer token, or a reference to one, is written with: the hash its old token was re-issued as. An old token the map
// never issued is refused, since the row would name a credential nothing in D1 holds
export const requireReissuedTokenHash = (idMap: IdMap, oldToken: string, tableName: string): string => {
  const tokenHash = idMap.reissuedTokenHashOf(oldToken);
  if (tokenHash === undefined)
    throw new InvalidOperationError(Operation.Read, tableName, "names a token that was never re-issued");

  return tokenHash;
};
