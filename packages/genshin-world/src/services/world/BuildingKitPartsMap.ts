import type { BuildingKitOptionsMap } from "#src/models/world/BuildingKitOptionsMap";
import type { BuildingPart } from "#src/models/world/BuildingPart";
import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";

import { BuildingKit } from "#src/models/world/BuildingKit";
import { FONTAINE_GOLD_COLOR, FONTAINE_IRON_COLOR } from "#src/services/fontaine/constants";
import { createFontaineBuildingGeometries } from "#src/services/fontaine/createFontaineBuildingGeometries";
import { INAZUMA_PLASTER_COLOR } from "#src/services/inazuma/constants";
import { createInazumaBuildingGeometry } from "#src/services/inazuma/createInazumaBuildingGeometry";
import { createLiyueBuildingGeometries } from "#src/services/liyue/createLiyueBuildingGeometries";
import { MONDSTADT_PLASTER_COLOR, MONDSTADT_ROOF_COLOR } from "#src/services/mondstadt/constants";
import { createMondstadtBuildingGeometries } from "#src/services/mondstadt/createMondstadtBuildingGeometries";
import { createDieselpunkGeometry } from "#src/services/nod-krai/createDieselpunkGeometry";
import { SNEZHNAYA_HALL_COLOR } from "#src/services/snezhnaya/constants";
import { createHallGeometry } from "#src/services/snezhnaya/createHallGeometry";
import { createRainforestCityGeometry } from "#src/services/sumeru/createRainforestCityGeometry";
import { createBuildingGeometry } from "genshin-engine";

// Each region's kit as the parts its building is drawn in: every geometry the kit returns, with its colour for the
// Material that geometry is drawn in. A colour its region's palette record samples is read from that record, and one it
// Leaves provisional or does not extract is the kit's own constant
export const BuildingKitPartsMap = {
  [BuildingKit.Fontaine]: (options, regionPalettes) => {
    const { awningGeometry, goldGeometry, ironGeometry, slateGeometry, stoneGeometry } =
      createFontaineBuildingGeometries(options);
    const palette = regionPalettes[BuildingKit.Fontaine];
    return [
      { color: palette.awning, geometry: awningGeometry },
      { color: FONTAINE_GOLD_COLOR, geometry: goldGeometry },
      { color: FONTAINE_IRON_COLOR, geometry: ironGeometry },
      { color: palette.slate, geometry: slateGeometry },
      { color: palette.stone, geometry: stoneGeometry },
    ];
  },
  [BuildingKit.Inazuma]: (options, regionPalettes) => {
    const { plasterGeometry, roofGeometry, timberGeometry } = createInazumaBuildingGeometry(options);
    const palette = regionPalettes[BuildingKit.Inazuma];
    return [
      { color: INAZUMA_PLASTER_COLOR, geometry: plasterGeometry },
      { color: palette.roofTile, geometry: roofGeometry },
      { color: palette.timber, geometry: timberGeometry },
    ];
  },
  [BuildingKit.Liyue]: (options, regionPalettes) => {
    const { lacquer, roof, stone } = createLiyueBuildingGeometries(options);
    const palette = regionPalettes[BuildingKit.Liyue];
    return [
      { color: palette.lacquer, geometry: lacquer },
      { color: palette.roof, geometry: roof },
      { color: palette.stone, geometry: stone },
    ];
  },
  [BuildingKit.Mondstadt]: (options, regionPalettes) => {
    const { plaster, roof, stone, timber } = createMondstadtBuildingGeometries(options);
    const palette = regionPalettes[BuildingKit.Mondstadt];
    return [
      { color: MONDSTADT_PLASTER_COLOR, geometry: plaster },
      { color: MONDSTADT_ROOF_COLOR, geometry: roof },
      { color: palette.stone, geometry: stone },
      { color: palette.timber, geometry: timber },
    ];
  },
  [BuildingKit.Natlan]: (options, regionPalettes) => [
    { color: regionPalettes[BuildingKit.Natlan].building, geometry: createBuildingGeometry(options) },
  ],
  [BuildingKit.NodKrai]: (options, regionPalettes) => [
    { color: regionPalettes[BuildingKit.NodKrai].iron, geometry: createDieselpunkGeometry(options) },
  ],
  [BuildingKit.Snezhnaya]: (options) => [{ color: SNEZHNAYA_HALL_COLOR, geometry: createHallGeometry(options) }],
  [BuildingKit.Sumeru]: (options, regionPalettes) => [
    { color: regionPalettes[BuildingKit.Sumeru].terrace, geometry: createRainforestCityGeometry(options) },
  ],
} as const satisfies {
  [TBuildingKit in BuildingKit]: (
    options: BuildingKitOptionsMap[TBuildingKit],
    regionPalettes: RegionPaletteMap,
  ) => BuildingPart[];
};
