import type { HostedAssetPreload } from "#src/models/HostedAssetPreload";
import type { HostedAssetPreloadSet } from "#src/models/HostedAssetPreloadSet";

import { HostedAssetPreloadStatus } from "#src/models/HostedAssetPreloadStatus";
import { preloadHostedAssets } from "#src/services/preloadHostedAssets";
import { getResultAsync, noop } from "@esposter/shared";
import { computed, ref } from "vue";

// A product's preload behind its loading bar: its set is read, then each file is held in the browser's cache.
// Its `downloadProgress` is the share of the bytes held, whole once every file is held.
// `onHeld` is called once every file is held. Each call plans again, so the files already held are not fetched twice.
export const useHostedAssetsPreload = (
  readPreloadSet: () => Promise<HostedAssetPreloadSet>,
  onHeld: () => void,
): HostedAssetPreload => {
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
    await getResultAsync(readPreloadSet)
      .andThen((preloadSet) =>
        preloadHostedAssets(
          preloadSet,
          (progress) => {
            loadedBytes.value = progress.loadedBytes;
            pendingBytes.value = progress.pendingBytes;
          },
          () => {
            status.value = HostedAssetPreloadStatus.Ready;
            onHeld();
          },
        ),
      )
      .match(noop, (error) => {
        console.error(error);
        status.value = HostedAssetPreloadStatus.Failed;
      });
  };
  return { downloadProgress, preload, status };
};
