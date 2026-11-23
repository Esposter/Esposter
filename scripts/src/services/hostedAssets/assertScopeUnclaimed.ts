import type { HostedAssetLock } from "hosted-assets";

import { InvalidOperationError, Operation } from "@esposter/shared";

// Refuses a scope that another product's lock already declares, or that sits under one, so no two products share a prefix
export const assertScopeUnclaimed = (scope: string, otherLocks: HostedAssetLock[]): void => {
  const claimedScope = otherLocks
    .flatMap((lock) => [...Object.values(lock.indexes), ...Object.values(lock.objects)])
    .map((object) => object.scope)
    .find((declaredScope) => scope === declaredScope || scope.startsWith(`${declaredScope}/`));
  if (claimedScope !== undefined)
    throw new InvalidOperationError(
      Operation.Create,
      scope,
      `is under ${claimedScope}, which another product's lock declares`,
    );
};
