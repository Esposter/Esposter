import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { measureAtmosphere } from "#src/services/genshinParity/passes/measureAtmosphere";
import { measureAudio } from "#src/services/genshinParity/passes/measureAudio";
import { measureCamera } from "#src/services/genshinParity/passes/measureCamera";
import { measureDisplay } from "#src/services/genshinParity/passes/measureDisplay";
import { measureInventory } from "#src/services/genshinParity/passes/measureInventory";
import { measureLayout } from "#src/services/genshinParity/passes/measureLayout";
import { measureLight } from "#src/services/genshinParity/passes/measureLight";
import { measureMotion } from "#src/services/genshinParity/passes/measureMotion";
import { measureShape } from "#src/services/genshinParity/passes/measureShape";
import { measureSurface } from "#src/services/genshinParity/passes/measureSurface";

// Each pass's measure over a component, every one in the units its own data reads in and gated at that data's noise;
// A pass with none yet stops the run there, its measure the next tool to build
// (apps/web/content/docs/proposals/genshin/recreation-passes.md)
export const ParityPassMeasureMap: Partial<
  Record<ParityPass, (component: DerivedAssetComponent) => Promise<ParityPassMeasure>>
> = {
  [ParityPass.Atmosphere]: measureAtmosphere,
  [ParityPass.Audio]: measureAudio,
  [ParityPass.Camera]: measureCamera,
  [ParityPass.Display]: measureDisplay,
  [ParityPass.Inventory]: measureInventory,
  [ParityPass.Layout]: measureLayout,
  [ParityPass.Light]: measureLight,
  [ParityPass.Motion]: measureMotion,
  [ParityPass.Shape]: measureShape,
  [ParityPass.Surface]: measureSurface,
};
