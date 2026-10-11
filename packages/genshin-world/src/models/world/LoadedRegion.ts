import type { RegionData } from "#src/models/world/RegionData";
import type { RegionGround } from "#src/models/world/RegionGround";
import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";

// A region as it loads in reach: its authored data, with the hosted records drawn with it, its ground laid over
// Windrise's where it lays one and the palettes of the kits its buildings are built by
export interface LoadedRegion extends RegionData {
  ground: RegionGround | undefined;
  regionPalettes: Partial<RegionPaletteMap>;
}
