import type { FontaineBuildingOptions } from "#src/models/fontaine/FontaineBuildingOptions";
import type { InazumaBuildingOptions } from "#src/models/inazuma/InazumaBuildingOptions";
import type { LiyueBuildingOptions } from "#src/models/liyue/LiyueBuildingOptions";
import type { MondstadtBuildingOptions } from "#src/models/mondstadt/MondstadtBuildingOptions";
import type { DieselpunkOptions } from "#src/models/nod-krai/DieselpunkOptions";
import type { HallOptions } from "#src/models/snezhnaya/HallOptions";
import type { RainforestCityOptions } from "#src/models/sumeru/RainforestCityOptions";
import type { BuildingKit } from "#src/models/world/BuildingKit";
import type { BuildingOptions } from "genshin-engine";

// The options each region's building kit takes: Natlan's tribes build on the engine's generic building, Sumeru's city
// Is its rainforest terraces, Nod-Krai's towns its dieselpunk works and Snezhnaya's capital its stepped halls
export interface BuildingKitOptionsMap {
  [BuildingKit.Fontaine]: FontaineBuildingOptions;
  [BuildingKit.Inazuma]: InazumaBuildingOptions;
  [BuildingKit.Liyue]: LiyueBuildingOptions;
  [BuildingKit.Mondstadt]: MondstadtBuildingOptions;
  [BuildingKit.Natlan]: BuildingOptions;
  [BuildingKit.NodKrai]: DieselpunkOptions;
  [BuildingKit.Snezhnaya]: HallOptions;
  [BuildingKit.Sumeru]: RainforestCityOptions;
}
