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
// Each kit's palette as its region's record holds it, fetched by its key from the hosted game data and checked against
// Its schema as it arrives. Each schema reads only the fields its kit colours with, so a field the palette leaves out is
// Never read and its kit keeps its constant. Snezhnaya's kit has no record, so it reads none
const BuildingKitPaletteReaderMap = {
  [BuildingKit.Fontaine]: async (gameDataBaseUrl) => ({
    [BuildingKit.Fontaine]: await readGameData(
      gameDataBaseUrl,
      "regions/fontaine/palette",
      z.object({ awning: paletteColourSchema, slate: paletteColourSchema, stone: paletteColourSchema }),
    ),
  }),
  [BuildingKit.Inazuma]: async (gameDataBaseUrl) => ({
    [BuildingKit.Inazuma]: await readGameData(
      gameDataBaseUrl,
      "regions/inazuma/palette",
      z.object({ roofTile: paletteColourSchema, timber: paletteColourSchema }),
    ),
  }),
  [BuildingKit.Liyue]: async (gameDataBaseUrl) => ({
    [BuildingKit.Liyue]: await readGameData(
      gameDataBaseUrl,
      "regions/liyue/palette",
      z.object({ lacquer: paletteColourSchema, roof: paletteColourSchema, stone: paletteColourSchema }),
    ),
  }),
  [BuildingKit.Mondstadt]: async (gameDataBaseUrl) => ({
    [BuildingKit.Mondstadt]: await readGameData(
      gameDataBaseUrl,
      "regions/mondstadt/palette",
      z.object({ stone: paletteColourSchema, timber: paletteColourSchema }),
    ),
  }),
  [BuildingKit.Natlan]: async (gameDataBaseUrl) => ({
    [BuildingKit.Natlan]: await readGameData(
      gameDataBaseUrl,
      "regions/natlan/palette",
      z.object({ building: paletteColourSchema }),
    ),
  }),
  [BuildingKit.NodKrai]: async (gameDataBaseUrl) => ({
    [BuildingKit.NodKrai]: await readGameData(
      gameDataBaseUrl,
      "regions/nod-krai/palette",
      z.object({ iron: paletteColourSchema }),
    ),
  }),
  [BuildingKit.Snezhnaya]: () => Promise.resolve({}),
  [BuildingKit.Sumeru]: async (gameDataBaseUrl) => ({
    [BuildingKit.Sumeru]: await readGameData(
      gameDataBaseUrl,
      "regions/sumeru/palette",
      z.object({ terrace: paletteColourSchema }),
    ),
  }),
} as const satisfies Record<BuildingKit, (gameDataBaseUrl: string) => Promise<Partial<RegionPaletteMap>>>;

// The palettes of the kits a region's buildings are built by, read with the region's data as it comes within reach, so
// A region out of reach reads none
export const readRegionPalettes = async (
  gameDataBaseUrl: string,
  landmarks: readonly Landmark[],
): Promise<Partial<RegionPaletteMap>> => {
  const buildingKits = new Set(
    landmarks.flatMap((landmark) => (landmark.kind === LandmarkKind.Building ? [landmark.building.kit] : [])),
  );
  const kitPalettes = await Promise.all(
    [...buildingKits].map((buildingKit) => BuildingKitPaletteReaderMap[buildingKit](gameDataBaseUrl)),
  );
  const regionPalettes: Partial<RegionPaletteMap> = {};
  for (const kitPalette of kitPalettes) Object.assign(regionPalettes, kitPalette);
  return regionPalettes;
};
