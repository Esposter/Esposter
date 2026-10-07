import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { measureCamera } from "#src/services/genshinParity/passes/measureCamera";
import { measureInventory } from "#src/services/genshinParity/passes/measureInventory";
import { measureLayout } from "#src/services/genshinParity/passes/measureLayout";

// Each pass's measure over a component, every one in the units its own data reads in and gated at that data's noise;
// A pass with none yet stops the run there, its measure the next tool to build
// (apps/web/content/docs/proposals/genshin/recreation-passes.md)
export const ParityPassMeasureMap: Partial<
  Record<ParityPass, (component: DerivedAssetComponent) => Promise<ParityPassMeasure>>
> = {
  [ParityPass.Camera]: measureCamera,
  [ParityPass.Inventory]: measureInventory,
  [ParityPass.Layout]: measureLayout,
};
