import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";

import { BuildingKit } from "#src/models/world/BuildingKit";
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

// Every region's palette record that has one, each fetched by its key from the hosted game data and checked against its
// Schema as it arrives. Each schema reads only the fields its kit colours with, so a field the palette leaves out is
// Never read and its kit keeps its constant
export const readRegionPalettes = async (gameDataBaseUrl: string): Promise<RegionPaletteMap> => {
  const [fontaine, inazuma, liyue, mondstadt, natlan, nodKrai, sumeru] = await Promise.all([
    readGameData(
      gameDataBaseUrl,
      "regions/fontaine/palette",
      z.object({ awning: paletteColourSchema, slate: paletteColourSchema, stone: paletteColourSchema }),
    ),
    readGameData(
      gameDataBaseUrl,
      "regions/inazuma/palette",
      z.object({ roofTile: paletteColourSchema, timber: paletteColourSchema }),
    ),
    readGameData(
      gameDataBaseUrl,
      "regions/liyue/palette",
      z.object({ lacquer: paletteColourSchema, roof: paletteColourSchema, stone: paletteColourSchema }),
    ),
    readGameData(
      gameDataBaseUrl,
      "regions/mondstadt/palette",
      z.object({ stone: paletteColourSchema, timber: paletteColourSchema }),
    ),
    readGameData(gameDataBaseUrl, "regions/natlan/palette", z.object({ building: paletteColourSchema })),
    readGameData(gameDataBaseUrl, "regions/nod-krai/palette", z.object({ iron: paletteColourSchema })),
    readGameData(gameDataBaseUrl, "regions/sumeru/palette", z.object({ terrace: paletteColourSchema })),
  ]);
  return {
    [BuildingKit.Fontaine]: fontaine,
    [BuildingKit.Inazuma]: inazuma,
    [BuildingKit.Liyue]: liyue,
    [BuildingKit.Mondstadt]: mondstadt,
    [BuildingKit.Natlan]: natlan,
    [BuildingKit.NodKrai]: nodKrai,
    [BuildingKit.Sumeru]: sumeru,
  };
};
