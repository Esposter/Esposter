import { createEvictingPromiseCache, ID_SEPARATOR } from "@esposter/shared";

// Provisioning is one-time setup for a fixed resource, but every request that touches it pays for it: a create
// Call (plus, for a container, an access-policy read) before the operation the caller actually wanted. On the
// Asset endpoint that is once per embedded image, so a published page with dozens of assets issues dozens of
// Each and invites account-level throttling. Memoizing the promise — not the resolved client — also means
// Concurrent callers share one round trip instead of racing their own.
export const createProvisionedClientCache = <TResource extends string, TClient>(
  provision: (connectionString: string, resource: TResource) => Promise<TClient>,
) =>
  createEvictingPromiseCache(
    (connectionString: string, resource: TResource) => `${connectionString}${ID_SEPARATOR}${resource}`,
    provision,
  );
