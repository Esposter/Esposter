import type { BuiltKit } from "#src/models/genshinAssets/kits/build/BuiltKit";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";

// What comparing a kit module with its sources gives: the overlay that makes the build reproduce the module, the build
// It gives, and each path where the build still differs from the module or why it failed, which a sound overlay leaves
// Empty
export interface KitComparison {
  built?: BuiltKit;
  failures: string[];
  overlay: KitOverlay;
}
