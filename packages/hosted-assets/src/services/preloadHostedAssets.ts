import type { HostedAssetPreloadSet } from "#src/models/HostedAssetPreloadSet";

import { HOSTED_ASSETS_CACHE_NAME } from "#src/services/constants";
import { downloadHostedAssetFiles } from "#src/services/downloadHostedAssetFiles";
import { evictStaleHostedAssets } from "#src/services/evictStaleHostedAssets";
import { listHeldHostedAssetUrls } from "#src/services/listHeldHostedAssetUrls";
import { planHostedAssetDownload } from "#src/services/planHostedAssetDownload";
import { getResultAsync, noop } from "@esposter/shared";

// The preload of a set's files into the shared cache: the files the cache lacks are fetched, and the bytes held are reported as progress.
// Once every file is held, the entries under the set's scope prefixes that it does not name are evicted.
// A file that fails stops the preload before any eviction, so the cache keeps every entry it held
export const preloadHostedAssets = (
  { files, scopePrefixes }: HostedAssetPreloadSet,
  onProgress: (progress: { loadedBytes: number; pendingBytes: number }) => void,
): ReturnType<typeof getResultAsync<void>> =>
  getResultAsync(async () => {
    const cache = await caches.open(HOSTED_ASSETS_CACHE_NAME);
    const plan = planHostedAssetDownload(files, await listHeldHostedAssetUrls(cache));
    onProgress({ loadedBytes: 0, pendingBytes: plan.pendingBytes });
    await downloadHostedAssetFiles(cache, plan.files, (loadedBytes) => {
      onProgress({ loadedBytes, pendingBytes: plan.pendingBytes });
    }).match(noop, (error) => {
      throw error;
    });
    await evictStaleHostedAssets(cache, scopePrefixes, new Set(files.map(({ url }) => url)));
  });
