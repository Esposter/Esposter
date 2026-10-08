import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";

// The references a component's passes are judged over, in the map's order, not its interface's backdrops: the ones
// Naming the component, so a screen several components share is measured by each over its own references alone
export const getComponentReferenceIds = (component: DerivedAssetComponent): string[] =>
  Object.entries(ParityReferenceMap)
    .filter(([, { component: referenceComponent, isBackdrop }]) => !isBackdrop && referenceComponent === component)
    .map(([referenceId]) => referenceId);
