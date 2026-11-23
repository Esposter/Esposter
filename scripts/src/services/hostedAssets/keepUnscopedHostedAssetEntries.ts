import { checkNamedByScopes } from "#src/services/hostedAssets/checkNamedByScopes";
import { takeOne } from "@esposter/shared";

// The entries of a lock map a publication leaves alone: those whose top-level scope the product declares, and that no
// Scope being published names, either as the whole scope or as the key itself
export const keepUnscopedHostedAssetEntries = <T>(
  entries: Record<string, T>,
  productScopes: readonly string[],
  scopes: string[],
): Record<string, T> =>
  Object.fromEntries(
    Object.entries(entries).filter(([key]) => {
      const scope = takeOne(key.split("/"));
      return productScopes.includes(scope) && !checkNamedByScopes(key, scopes);
    }),
  );
