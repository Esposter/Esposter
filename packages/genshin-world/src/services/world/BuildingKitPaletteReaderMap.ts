import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";

import { BuildingKit } from "#src/models/world/BuildingKit";
import { FONTAINE_AWNING_COLOR, FONTAINE_SLATE_COLOR, FONTAINE_STONE_COLOR } from "#src/services/fontaine/constants";
import { INAZUMA_ROOF_TILE_COLOR, INAZUMA_TIMBER_COLOR } from "#src/services/inazuma/constants";
import { LIYUE_LACQUER_COLOR, LIYUE_ROOF_COLOR, LIYUE_STONE_COLOR } from "#src/services/liyue/constants";
import { MONDSTADT_STONE_COLOR, MONDSTADT_TIMBER_COLOR } from "#src/services/mondstadt/constants";
import { NATLAN_BUILDING_COLOR } from "#src/services/natlan/constants";
import { NOD_KRAI_IRON_COLOR } from "#src/services/nod-krai/constants";
import { SUMERU_TERRACE_COLOR } from "#src/services/sumeru/constants";
import { createPaletteReader } from "#src/services/world/createPaletteReader";

// The reader of each kit's palette: its record fetched by its key from the hosted game data and checked against its
// Schema as it arrives, given as the bare palette the kit is coloured with and keyed by its kit at the caller. A field
// The palette leaves out, as a publish does when it samples none of the kit's textures, reads as the kit's own
// Constant, so the kit keeps that colour. Snezhnaya's kit has no record, so it has no reader
export const BuildingKitPaletteReaderMap: {
  [K in keyof RegionPaletteMap]: (gameDataBaseUrl: string) => Promise<RegionPaletteMap[K]>;
} = {
  [BuildingKit.Fontaine]: createPaletteReader("regions/fontaine/palette", {
    awning: FONTAINE_AWNING_COLOR,
    slate: FONTAINE_SLATE_COLOR,
    stone: FONTAINE_STONE_COLOR,
  }),
  [BuildingKit.Inazuma]: createPaletteReader("regions/inazuma/palette", {
    roofTile: INAZUMA_ROOF_TILE_COLOR,
    timber: INAZUMA_TIMBER_COLOR,
  }),
  [BuildingKit.Liyue]: createPaletteReader("regions/liyue/palette", {
    lacquer: LIYUE_LACQUER_COLOR,
    roof: LIYUE_ROOF_COLOR,
    stone: LIYUE_STONE_COLOR,
  }),
  [BuildingKit.Mondstadt]: createPaletteReader("regions/mondstadt/palette", {
    stone: MONDSTADT_STONE_COLOR,
    timber: MONDSTADT_TIMBER_COLOR,
  }),
  [BuildingKit.Natlan]: createPaletteReader("regions/natlan/palette", { building: NATLAN_BUILDING_COLOR }),
  [BuildingKit.NodKrai]: createPaletteReader("regions/nod-krai/palette", { iron: NOD_KRAI_IRON_COLOR }),
  [BuildingKit.Sumeru]: createPaletteReader("regions/sumeru/palette", { terrace: SUMERU_TERRACE_COLOR }),
};
