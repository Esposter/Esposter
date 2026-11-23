// Deletes the cached entries under the given scope prefixes that the current set does not name. The cache is shared by
// Every product, so an entry under a prefix the caller does not own is never read for eviction and never deleted
export const evictStaleHostedAssets = async (
  cache: Pick<Cache, "delete" | "keys">,
  scopePrefixes: readonly string[],
  keptUrls: ReadonlySet<string>,
): Promise<void> => {
  const requests = await cache.keys();
  await Promise.all(
    requests
      .filter(({ url }) => !keptUrls.has(url) && scopePrefixes.some((prefix) => url.startsWith(prefix)))
      .map(({ url }) => cache.delete(url)),
  );
};
