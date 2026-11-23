// Deletes the cached entries under the given scope prefixes that the current set does not name. `heldUrls` is what the cache
// Held before the download, which only added the set's own files, so the entries left to evict are read from it rather than
// From a second listing. The cache is shared by every product, so an entry under a prefix the caller does not own is never
// Read for eviction and never deleted.
export const evictStaleHostedAssets = async (
  cache: Pick<Cache, "delete">,
  heldUrls: ReadonlySet<string>,
  scopePrefixes: readonly string[],
  keptUrls: ReadonlySet<string>,
): Promise<void> => {
  await Promise.all(
    [...heldUrls]
      .filter((url) => !keptUrls.has(url) && scopePrefixes.some((prefix) => url.startsWith(prefix)))
      .map((url) => cache.delete(url)),
  );
};
