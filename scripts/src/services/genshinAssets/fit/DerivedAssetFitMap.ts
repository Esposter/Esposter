import type { DerivedAssetFit } from "#src/models/genshinAssets/fit/DerivedAssetFit";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { createRegionFit } from "#src/services/genshinAssets/fit/createRegionFit";
import { fitHud } from "#src/services/genshinAssets/fit/fitHud";
import { fitLoginScene } from "#src/services/genshinAssets/fit/fitLoginScene";
import { fitRiverCourses } from "#src/services/genshinAssets/fit/fitRiverCourses";
import { fitWaterfallSheets } from "#src/services/genshinAssets/fit/fitWaterfallSheets";
import { fitWindriseScene } from "#src/services/genshinAssets/fit/fitWindriseScene";

// Each component's fit, which reads its exports and returns the parameters of ours they fit as records under their
// Keys: every fit of the component's, or only those named. A component with no fit yet has no entry
export const DerivedAssetFitMap: Partial<Record<DerivedAssetComponent, DerivedAssetFit>> = {
  [DerivedAssetComponent.Fontaine]: createRegionFit(DerivedAssetComponent.Fontaine),
  [DerivedAssetComponent.Hud]: fitHud,
  [DerivedAssetComponent.Inazuma]: createRegionFit(DerivedAssetComponent.Inazuma, {
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Inazuma, fitOptions),
  }),
  [DerivedAssetComponent.Liyue]: createRegionFit(DerivedAssetComponent.Liyue, {
    rivers: (fitOptions) => fitRiverCourses(DerivedAssetComponent.Liyue, fitOptions),
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Liyue, fitOptions),
  }),
  [DerivedAssetComponent.Login]: fitLoginScene,
  [DerivedAssetComponent.Mondstadt]: createRegionFit(DerivedAssetComponent.Mondstadt, {
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Mondstadt, fitOptions),
  }),
  [DerivedAssetComponent.Natlan]: createRegionFit(DerivedAssetComponent.Natlan, {
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Natlan, fitOptions),
  }),
  [DerivedAssetComponent.NodKrai]: createRegionFit(DerivedAssetComponent.NodKrai),
  [DerivedAssetComponent.Snezhnaya]: createRegionFit(DerivedAssetComponent.Snezhnaya),
  [DerivedAssetComponent.Sumeru]: createRegionFit(DerivedAssetComponent.Sumeru, {
    waterfalls: (fitOptions) => fitWaterfallSheets(DerivedAssetComponent.Sumeru, fitOptions),
  }),
  [DerivedAssetComponent.Windrise]: fitWindriseScene,
};
