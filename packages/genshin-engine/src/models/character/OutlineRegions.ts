import type { ShadingRegionColours } from "#src/models/character/ShadingRegionColours";

// A game model's outline by region: each region's outline colour, "_OutlineColor" and its later regions, and how far
// Each is drawn toward a fifth of the main texture, "_OutLineIntensity" and its later regions
export interface OutlineRegions {
  colors: ShadingRegionColours;
  intensities: Record<keyof ShadingRegionColours, number>;
}
