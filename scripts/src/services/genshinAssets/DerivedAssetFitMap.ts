import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { fitLoginScene } from "#src/services/genshinAssets/fitLoginScene";

// Each component's fit, which reads its exports and writes the parameters of ours they fit, returning where
export const DerivedAssetFitMap: Record<DerivedAssetComponent, () => Promise<string>> = {
  [DerivedAssetComponent.Login]: fitLoginScene,
};
