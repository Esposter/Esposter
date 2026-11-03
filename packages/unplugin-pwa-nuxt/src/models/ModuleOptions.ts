import type { VitePWAOptions, VitePWAStrategy } from "@unplugin-pwa/core";
import type { SWType } from "@vite-pwa/workbox-build/types";

// The engine's own options under the `pwa` key, none redeclared here: the engine owns their names, defaults and
// Validation, and a default restated beside it would drift from the release that changes it. The one exception is the
// Icon generator, which the app runs with its own command and so is refused here rather than passed to the engine
export interface ModuleOptions extends Partial<VitePWAOptions<VitePWAStrategy, SWType>> {
  /**
   * Seconds between checks for a new service worker. Absent, only the browser's own navigation check runs.
   */
  periodicSyncForUpdates?: number;
  pwaAssets?: never;
}
