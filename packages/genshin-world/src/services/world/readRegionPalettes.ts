import type { Landmark } from "#src/models/world/Landmark";
import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";

import { BuildingKit } from "#src/models/world/BuildingKit";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// A palette colour is its hex as the publish writes it, read as the number a material is coloured with
const paletteColourSchema = z
  .object({
    hex: z
      .string()
      .regex(/^#[\da-f]{6}$/iu)
      .transform((hex) => Number.parseInt(hex.slice(1), 16)),
  })
  .transform(({ hex }) => hex);
// The reader of each kit's palette: its record fetched by its key from the hosted game data and checked against its
// Schema as it arrives, given as the bare palette the kit is coloured with and keyed by its kit at the caller. Each
// Schema reads only the fields its kit colours with, so a field the palette leaves out is never read and its kit keeps
// Its constant. Snezhnaya's kit has no record, so it has no reader
const BuildingKitPaletteReaderMap: {
  [K in keyof RegionPaletteMap]: (gameDataBaseUrl: string) => Promise<RegionPaletteMap[K]>;
} = {
  [BuildingKit.Fontaine]: (gameDataBaseUrl) =>
    readGameData(
      gameDataBaseUrl,
      "regions/fontaine/palette",
      z.object({ awning: paletteColourSchema, slate: paletteColourSchema, stone: paletteColourSchema }),
    ),
  [BuildingKit.Inazuma]: (gameDataBaseUrl) =>
    readGameData(
      gameDataBaseUrl,
      "regions/inazuma/palette",
      z.object({ roofTile: paletteColourSchema, timber: paletteColourSchema }),
    ),
  [BuildingKit.Liyue]: (gameDataBaseUrl) =>
    readGameData(
      gameDataBaseUrl,
      "regions/liyue/palette",
      z.object({ lacquer: paletteColourSchema, roof: paletteColourSchema, stone: paletteColourSchema }),
    ),
  [BuildingKit.Mondstadt]: (gameDataBaseUrl) =>
    readGameData(
      gameDataBaseUrl,
      "regions/mondstadt/palette",
      z.object({ stone: paletteColourSchema, timber: paletteColourSchema }),
    ),
  [BuildingKit.Natlan]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "regions/natlan/palette", z.object({ building: paletteColourSchema })),
  [BuildingKit.NodKrai]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "regions/nod-krai/palette", z.object({ iron: paletteColourSchema })),
  [BuildingKit.Sumeru]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "regions/sumeru/palette", z.object({ terrace: paletteColourSchema })),
};
// Whether a kit has a palette record to read, which Snezhnaya's does not
const checkIsPaletteKit = (buildingKit: BuildingKit): buildingKit is keyof RegionPaletteMap =>
  buildingKit in BuildingKitPaletteReaderMap;
// Sets a kit's palette under the kit's own key, generic so the key and the palette it takes are checked against each other
const setKitPalette = <K extends keyof RegionPaletteMap>(
  regionPalettes: Partial<RegionPaletteMap>,
  buildingKit: K,
  palette: RegionPaletteMap[K],
): void => {
  regionPalettes[buildingKit] = palette;
};

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
