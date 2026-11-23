import type { HostedAssetLock } from "hosted-assets";

import { InvalidOperationError, Operation } from "@esposter/shared";

// Refuses a scope that overlaps one another product's lock already declares, whichever is the prefix, so the products'
// Scopes stay disjoint
export const assertScopeUnclaimed = (scope: string, otherLocks: HostedAssetLock[]): void => {
  const claimedScope = otherLocks
    .flatMap((lock) => [...Object.values(lock.indexes), ...Object.values(lock.objects)])
    .map((object) => object.scope)
    .find(
      (declaredScope) =>
        scope === declaredScope || scope.startsWith(`${declaredScope}/`) || declaredScope.startsWith(`${scope}/`),
    );
  if (claimedScope !== undefined)
    throw new InvalidOperationError(
      Operation.Create,
      scope,
      `overlaps ${claimedScope}, which another product's lock declares`,
    );
};
