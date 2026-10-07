import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { getComponentReferenceIds } from "#src/services/genshinParity/passes/getComponentReferenceIds";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";

// The references of a component the current build drew with landmarks to solve their camera by, the ones the passes
// Judging its geometry are read over
export const getCurrentBuildReferenceIds = (component: DerivedAssetComponent): string[] =>
  getComponentReferenceIds(component).filter((referenceId) => {
    const reference = ParityReferenceMap[referenceId];
    return reference?.landmarks && !reference.isOtherBuild;
  });
