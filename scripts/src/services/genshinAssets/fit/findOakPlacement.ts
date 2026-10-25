import type { AssetPlacement } from "#src/models/genshinAssets/shared/AssetPlacement";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The export's placement of one of the oak's meshes, the mesh it draws by name
export const findOakPlacement = (placements: AssetPlacement[], mesh: string): AssetPlacement => {
  const placement = placements.find((candidate) => candidate.mesh === mesh);
  if (!placement) throw new InvalidOperationError(Operation.Read, DerivedAssetComponent.Windrise, `places no ${mesh}`);
  return placement;
};
