import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitHud } from "#src/services/genshinAssets/fit/fitHud";
import { fitLoginScene } from "#src/services/genshinAssets/fit/fitLoginScene";
import { fitWindriseScene } from "#src/services/genshinAssets/fit/fitWindriseScene";

// Each component's fit, which reads its exports and returns the parameters of ours they fit as records under their
// Keys: every fit of the component's, or only those named. A component with no fit yet has no entry
export const DerivedAssetFitMap: Partial<
  Record<DerivedAssetComponent, (only?: readonly string[]) => Promise<GameDataBuild>>
> = {
  [DerivedAssetComponent.Hud]: fitHud,
  [DerivedAssetComponent.Login]: fitLoginScene,
  [DerivedAssetComponent.Windrise]: fitWindriseScene,
};
