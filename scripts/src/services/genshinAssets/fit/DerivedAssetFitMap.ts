import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitLoginScene } from "#src/services/genshinAssets/fit/fitLoginScene";
import { fitWindriseScene } from "#src/services/genshinAssets/fit/fitWindriseScene";

// Each component's fit, which reads its exports and writes the parameters of ours they fit, returning where: every
// Fit of the component's, or only those named, with the one option a fit reads (the statue's angle count). A component
// With no fit yet has no entry
export const DerivedAssetFitMap: Partial<
  Record<DerivedAssetComponent, (only?: readonly string[], angleCount?: number) => Promise<string>>
> = { [DerivedAssetComponent.Login]: fitLoginScene, [DerivedAssetComponent.Windrise]: fitWindriseScene };
