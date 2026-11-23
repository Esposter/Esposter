import type { HostedAssetPreloadSet } from "#src/models/HostedAssetPreloadSet";
import type { HostedAssetsPreload } from "#src/models/HostedAssetsPreload";

import { HostedAssetPreloadStatus } from "#src/models/HostedAssetPreloadStatus";
import { preloadHostedAssets } from "#src/services/preloadHostedAssets";
import { getResultAsync, noop } from "@esposter/shared";
import { computed, ref } from "vue";

// A product's preload behind its loading bar: the set is read, and each of its files is held in the browser's cache, with
// The share of their bytes held as `downloadProgress`, whole once every file is held. `onHeld` is called once every file
// Is held. Each call plans again, so the files already held are not fetched twice
export const useHostedAssetsPreload = (
  readPreloadSet: () => Promise<HostedAssetPreloadSet>,
  onHeld: () => void,
): HostedAssetsPreload => {
  const status = ref<HostedAssetPreloadStatus>(HostedAssetPreloadStatus.Idle);
  const loadedBytes = ref(0);
  const pendingBytes = ref(0);
  const downloadProgress = computed(() => {
    if (status.value === HostedAssetPreloadStatus.Ready) return 1;
    return pendingBytes.value > 0 ? loadedBytes.value / pendingBytes.value : 0;
  });
  const preload = async (): Promise<void> => {
    status.value = HostedAssetPreloadStatus.Downloading;
    loadedBytes.value = 0;
    pendingBytes.value = 0;
    await getResultAsync(async () => {
      await preloadHostedAssets(await readPreloadSet(), (progress) => {
        loadedBytes.value = progress.loadedBytes;
        pendingBytes.value = progress.pendingBytes;
      }).match(noop, (error) => {
        throw error;
      });
    }).match(
      () => {
        status.value = HostedAssetPreloadStatus.Ready;
        onHeld();
      },
      (error) => {
        console.error(error);
        status.value = HostedAssetPreloadStatus.Failed;
      },
    );
  };
  return { downloadProgress, preload, status };
};
