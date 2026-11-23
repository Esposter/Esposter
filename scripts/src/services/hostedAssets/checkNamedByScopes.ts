import { takeOne } from "@esposter/shared";

// Whether a scope list names a lock key: a scope names the key itself, or the top-level scope the key sits under
export const checkNamedByScopes = (key: string, scopes: readonly string[]): boolean => {
  const scope = takeOne(key.split("/"));
  return scopes.some((named) => named === key || named === scope);
};
