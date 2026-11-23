import type { HostedAssetPreloadStatus } from "#src/models/HostedAssetPreloadStatus";
import type { ComputedRef, Ref } from "vue";

// What a product's preload composable hands its loading bar: the share of its bytes held, the call that holds them, and
// Where the preload stands
export interface HostedAssetPreload {
  downloadProgress: ComputedRef<number>;
  preload: () => Promise<void>;
  status: Ref<HostedAssetPreloadStatus>;
}
