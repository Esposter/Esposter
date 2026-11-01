import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";

// Sets a kit's palette under the kit's own key, generic so the key and the palette it takes are checked against each other
export const setKitPalette = <K extends keyof RegionPaletteMap>(
  regionPalettes: Partial<RegionPaletteMap>,
  buildingKit: K,
  palette: RegionPaletteMap[K],
): void => {
  regionPalettes[buildingKit] = palette;
};
