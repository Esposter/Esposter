import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { PARITY_PASSES_DIRECTORY } from "#src/services/genshinParity/passes/constants";
import { join } from "node:path";

// The committed report of a component's last run of its passes
export const getParityPassesPath = (component: DerivedAssetComponent): string =>
  join(PARITY_PASSES_DIRECTORY, `${component}.snapshot.md`);
