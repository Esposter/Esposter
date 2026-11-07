import type { DerivedAssetFit } from "#src/models/genshinAssets/fit/DerivedAssetFit";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { createCharacterFit } from "#src/services/genshinAssets/fit/createCharacterFit";
import { createInterfaceRectsFit } from "#src/services/genshinAssets/fit/createInterfaceRectsFit";
import { createRegionFit } from "#src/services/genshinAssets/fit/createRegionFit";
import { fitLoginScene } from "#src/services/genshinAssets/fit/fitLoginScene";
import { fitProps } from "#src/services/genshinAssets/fit/fitProps";
import { createRegionPlantsFit } from "#src/services/genshinAssets/fit/fitRegionPlants";
import { createRegionRocksFit } from "#src/services/genshinAssets/fit/fitRegionRocks";
import { createRegionRuinsFit } from "#src/services/genshinAssets/fit/fitRegionRuins";
import { fitRegionStatue } from "#src/services/genshinAssets/fit/fitRegionStatue";
import { fitRiverCourses } from "#src/services/genshinAssets/fit/fitRiverCourses";
import { fitWaterfallSheets } from "#src/services/genshinAssets/fit/fitWaterfallSheets";
import { fitWeaponShapes } from "#src/services/genshinAssets/fit/fitWeaponShapes";
import { fitWindriseScene } from "#src/services/genshinAssets/fit/fitWindriseScene";

// A region's plants and rocks, the two records every region with rocks fits beside each other
const createRegionPlantsRocksFits = (region: DerivedAssetComponent) => ({
  plants: createRegionPlantsFit(region),
  rocks: createRegionRocksFit(region),
});

// Each component's fit, which reads its exports and returns the parameters of ours they fit as records under their
// Keys: every fit of the component's, or only those named. A component with no fit yet has no entry
export const DerivedAssetFitMap: Partial<Record<DerivedAssetComponent, DerivedAssetFit>> = {
  [DerivedAssetComponent.Character]: createCharacterFit,
  [DerivedAssetComponent.Fontaine]: createRegionFit(
    DerivedAssetComponent.Fontaine,
    createRegionPlantsRocksFits(DerivedAssetComponent.Fontaine),
  ),
  [DerivedAssetComponent.Hud]: createInterfaceRectsFit(DerivedAssetComponent.Hud),
  [DerivedAssetComponent.Inazuma]: createRegionFit(DerivedAssetComponent.Inazuma, {
    ...createRegionPlantsRocksFits(DerivedAssetComponent.Inazuma),
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Inazuma, fitOptions),
  }),
  // Its rocks are not fitted yet: its karst and stone forests are built by the Liyue change, and the rest wait on that split
  [DerivedAssetComponent.Liyue]: createRegionFit(DerivedAssetComponent.Liyue, {
    plants: createRegionPlantsFit(DerivedAssetComponent.Liyue),
    rivers: (fitOptions) => fitRiverCourses(DerivedAssetComponent.Liyue, fitOptions),
    statue: () => fitRegionStatue(DerivedAssetComponent.Liyue),
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Liyue, fitOptions),
  }),
  [DerivedAssetComponent.Login]: fitLoginScene,
  [DerivedAssetComponent.Mondstadt]: createRegionFit(DerivedAssetComponent.Mondstadt, {
    ...createRegionPlantsRocksFits(DerivedAssetComponent.Mondstadt),
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Mondstadt, fitOptions),
  }),
  [DerivedAssetComponent.Natlan]: createRegionFit(DerivedAssetComponent.Natlan, {
    ...createRegionPlantsRocksFits(DerivedAssetComponent.Natlan),
    statue: () => fitRegionStatue(DerivedAssetComponent.Natlan),
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Natlan, fitOptions),
  }),
  [DerivedAssetComponent.NodKrai]: createRegionFit(
    DerivedAssetComponent.NodKrai,
    createRegionPlantsRocksFits(DerivedAssetComponent.NodKrai),
  ),
  [DerivedAssetComponent.Props]: fitProps,
  [DerivedAssetComponent.Snezhnaya]: createRegionFit(DerivedAssetComponent.Snezhnaya, {
    ...createRegionPlantsRocksFits(DerivedAssetComponent.Snezhnaya),
    statue: () => fitRegionStatue(DerivedAssetComponent.Snezhnaya),
  }),
  [DerivedAssetComponent.Sumeru]: createRegionFit(DerivedAssetComponent.Sumeru, {
    ...createRegionPlantsRocksFits(DerivedAssetComponent.Sumeru),
    ruins: createRegionRuinsFit(DerivedAssetComponent.Sumeru),
    statue: () => fitRegionStatue(DerivedAssetComponent.Sumeru),
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Sumeru, fitOptions),
  }),
  [DerivedAssetComponent.Weapons]: fitWeaponShapes,
  [DerivedAssetComponent.Windrise]: fitWindriseScene,
};
