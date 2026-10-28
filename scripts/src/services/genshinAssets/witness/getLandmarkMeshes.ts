import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { DerivedAssetLandmarkMap } from "#src/services/genshinAssets/witness/DerivedAssetLandmarkMap";

// The exact names of the meshes a component's landmarks stand on, which the export takes by name and `pose` draws alone
export const getLandmarkMeshes = (component: DerivedAssetComponent): string[] =>
  Object.values(DerivedAssetLandmarkMap[component]).map(({ mesh }) => mesh);
