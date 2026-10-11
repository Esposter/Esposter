import type { RegionData } from "#src/models/world/RegionData";
import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";

// A region as it loads in reach: its authored data, with the hosted records drawn with it, the palettes of the kits its
// Buildings are built by
export interface LoadedRegion extends RegionData {
  regionPalettes: Partial<RegionPaletteMap>;
}
