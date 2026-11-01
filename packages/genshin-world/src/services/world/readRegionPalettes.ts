import type { Landmark } from "#src/models/world/Landmark";
import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { BuildingKitPaletteReaderMap } from "#src/services/world/BuildingKitPaletteReaderMap";
import { checkIsPaletteKit } from "#src/services/world/checkIsPaletteKit";
import { setKitPalette } from "#src/services/world/setKitPalette";

// The palettes of the kits a region's buildings are built by, read with the region's data as it comes within reach, so
// A region out of reach reads none
export const readRegionPalettes = async (
  gameDataBaseUrl: string,
  landmarks: readonly Landmark[],
): Promise<Partial<RegionPaletteMap>> => {
  const buildingKits = new Set(
    landmarks.flatMap((landmark) => (landmark.kind === LandmarkKind.Building ? [landmark.building.kit] : [])),
  );
  const regionPalettes: Partial<RegionPaletteMap> = {};
  await Promise.all(
    Array.from(buildingKits, async (buildingKit) => {
      if (!checkIsPaletteKit(buildingKit)) return;
      const palette = await BuildingKitPaletteReaderMap[buildingKit](gameDataBaseUrl);
      setKitPalette(regionPalettes, buildingKit, palette);
    }),
  );
  return regionPalettes;
};
