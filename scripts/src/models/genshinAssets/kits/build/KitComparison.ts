import type { BuiltKit } from "#src/models/genshinAssets/kits/build/BuiltKit";
import type { KitOverlay } from "#src/models/shared/KitOverlay";

// What comparing a kit's published record with its sources gives: the overlay that makes the build reproduce the record,
// The build it gives, and each path where the build still differs from the record or why it failed, which a sound
// Overlay leaves empty
export interface KitComparison {
  built?: BuiltKit;
  failures: string[];
  overlay: KitOverlay;
}
