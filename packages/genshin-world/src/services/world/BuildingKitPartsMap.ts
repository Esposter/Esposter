import type { BuildingKitOptionsMap } from "#src/models/world/BuildingKitOptionsMap";
import type { BuildingPart } from "#src/models/world/BuildingPart";

import { BuildingKit } from "#src/models/world/BuildingKit";
import {
  FONTAINE_AWNING_COLOR,
  FONTAINE_GOLD_COLOR,
  FONTAINE_IRON_COLOR,
  FONTAINE_SLATE_COLOR,
  FONTAINE_STONE_COLOR,
} from "#src/services/fontaine/constants";
import { createFontaineBuildingGeometries } from "#src/services/fontaine/createFontaineBuildingGeometries";
import { INAZUMA_PLASTER_COLOR, INAZUMA_ROOF_TILE_COLOR, INAZUMA_TIMBER_COLOR } from "#src/services/inazuma/constants";
import { createInazumaBuildingGeometry } from "#src/services/inazuma/createInazumaBuildingGeometry";
import { LIYUE_LACQUER_COLOR, LIYUE_ROOF_COLOR, LIYUE_STONE_COLOR } from "#src/services/liyue/constants";
import { createLiyueBuildingGeometries } from "#src/services/liyue/createLiyueBuildingGeometries";
import {
  MONDSTADT_PLASTER_COLOR,
  MONDSTADT_ROOF_COLOR,
  MONDSTADT_STONE_COLOR,
  MONDSTADT_TIMBER_COLOR,
} from "#src/services/mondstadt/constants";
import { createMondstadtBuildingGeometries } from "#src/services/mondstadt/createMondstadtBuildingGeometries";
import { NATLAN_BUILDING_COLOR } from "#src/services/natlan/constants";
import { NOD_KRAI_IRON_COLOR } from "#src/services/nod-krai/constants";
import { createDieselpunkGeometry } from "#src/services/nod-krai/createDieselpunkGeometry";
import { SNEZHNAYA_HALL_COLOR } from "#src/services/snezhnaya/constants";
import { createHallGeometry } from "#src/services/snezhnaya/createHallGeometry";
import { SUMERU_TERRACE_COLOR } from "#src/services/sumeru/constants";
import { createRainforestCityGeometry } from "#src/services/sumeru/createRainforestCityGeometry";
import { createBuildingGeometry } from "genshin-engine";

// Each region's kit as the parts its building is drawn in: every geometry the kit returns, with its region's colour for
// The material that geometry is drawn in
export const BuildingKitPartsMap = {
  [BuildingKit.Fontaine]: (options) => {
    const { awningGeometry, goldGeometry, ironGeometry, slateGeometry, stoneGeometry } =
      createFontaineBuildingGeometries(options);
    return [
      { color: FONTAINE_AWNING_COLOR, geometry: awningGeometry },
      { color: FONTAINE_GOLD_COLOR, geometry: goldGeometry },
      { color: FONTAINE_IRON_COLOR, geometry: ironGeometry },
      { color: FONTAINE_SLATE_COLOR, geometry: slateGeometry },
      { color: FONTAINE_STONE_COLOR, geometry: stoneGeometry },
    ];
  },
  [BuildingKit.Inazuma]: (options) => {
    const { plasterGeometry, roofGeometry, timberGeometry } = createInazumaBuildingGeometry(options);
    return [
      { color: INAZUMA_PLASTER_COLOR, geometry: plasterGeometry },
      { color: INAZUMA_ROOF_TILE_COLOR, geometry: roofGeometry },
      { color: INAZUMA_TIMBER_COLOR, geometry: timberGeometry },
    ];
  },
  [BuildingKit.Liyue]: (options) => {
    const { lacquer, roof, stone } = createLiyueBuildingGeometries(options);
    return [
      { color: LIYUE_LACQUER_COLOR, geometry: lacquer },
      { color: LIYUE_ROOF_COLOR, geometry: roof },
      { color: LIYUE_STONE_COLOR, geometry: stone },
    ];
  },
  [BuildingKit.Mondstadt]: (options) => {
    const { plaster, roof, stone, timber } = createMondstadtBuildingGeometries(options);
    return [
      { color: MONDSTADT_PLASTER_COLOR, geometry: plaster },
      { color: MONDSTADT_ROOF_COLOR, geometry: roof },
      { color: MONDSTADT_STONE_COLOR, geometry: stone },
      { color: MONDSTADT_TIMBER_COLOR, geometry: timber },
    ];
  },
  [BuildingKit.Natlan]: (options) => [{ color: NATLAN_BUILDING_COLOR, geometry: createBuildingGeometry(options) }],
  [BuildingKit.NodKrai]: (options) => [{ color: NOD_KRAI_IRON_COLOR, geometry: createDieselpunkGeometry(options) }],
  [BuildingKit.Snezhnaya]: (options) => [{ color: SNEZHNAYA_HALL_COLOR, geometry: createHallGeometry(options) }],
  [BuildingKit.Sumeru]: (options) => [{ color: SUMERU_TERRACE_COLOR, geometry: createRainforestCityGeometry(options) }],
} as const satisfies {
  [TBuildingKit in BuildingKit]: (options: BuildingKitOptionsMap[TBuildingKit]) => BuildingPart[];
};
