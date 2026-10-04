import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { fitLoginScene } from "#src/services/genshinAssets/fitLoginScene";

// Each component's fit, which reads its exports and writes the parameters of ours they fit, returning where: every
// Fit of the component's, or only those named
export const DerivedAssetFitMap: Record<DerivedAssetComponent, (only?: readonly string[]) => Promise<string>> = {
  [DerivedAssetComponent.Login]: fitLoginScene,
};
