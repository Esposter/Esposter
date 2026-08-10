import { getResultAsync, ID_SEPARATOR } from "@esposter/shared";
// Provisioning is one-time setup for a fixed resource, but every request that touches it pays for it: a create
// Call (plus, for a container, an access-policy read) before the operation the caller actually wanted. On the
// Asset endpoint that is once per embedded image, so a published page with dozens of assets issues dozens of
// Each and invites account-level throttling. Memoizing the promise — not the resolved client — also means
// Concurrent callers share one round trip instead of racing their own.
export const createProvisionedClientCache = <TResource extends string, TClient>(
  provision: (connectionString: string, resource: TResource) => Promise<TClient>,
): ((connectionString: string, resource: TResource) => Promise<TClient>) => {
  const clientMap = new Map<string, Promise<TClient>>();
  return (connectionString, resource) => {
    const key = `${connectionString}${ID_SEPARATOR}${resource}`;
    const clientPromise = clientMap.get(key) ?? provision(connectionString, resource);
    clientMap.set(key, clientPromise);
    // A failed provision must not be remembered — the next caller has to be able to retry it. Only evict the
    // Entry this call installed: a caller that already retried past the rejection has stored a good promise
    // Under the same key, and dropping that one would re-pay the provisioning round trips the memo exists for
    return getResultAsync(() => clientPromise).match(
      (client) => client,
      (error) => {
        if (clientMap.get(key) === clientPromise) clientMap.delete(key);
        throw error;
      },
    );
  };
};
