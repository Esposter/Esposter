import type { HostedAssetPreloadStatus } from "#src/models/HostedAssetPreloadStatus";
import type { ComputedRef, Ref } from "vue";

// What a product's preload composable hands its loading bar: the share of its bytes held, whether bytes are still being
// Fetched, the call that holds them, and where the preload stands
export interface HostedAssetPreload {
  downloadProgress: ComputedRef<number>;
  isDownloading: ComputedRef<boolean>;
  preload: () => Promise<void>;
  status: Ref<HostedAssetPreloadStatus>;
}
