import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";

// The references a component's screen is judged against, in the map's order, not its interface's backdrops
export const getComponentReferenceIds = (component: DerivedAssetComponent): string[] =>
  Object.entries(ParityReferenceMap)
    .filter(([, { isBackdrop, screen }]) => !isBackdrop && screen === DerivedAssetComponentMap[component].screen)
    .map(([referenceId]) => referenceId);
