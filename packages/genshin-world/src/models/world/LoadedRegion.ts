import type { RegionData } from "#src/models/world/RegionData";
import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";

// A region as it loads in reach: its authored data, with the hosted palettes of the kits its buildings are built by
export interface LoadedRegion extends RegionData {
  regionPalettes: Partial<RegionPaletteMap>;
}
