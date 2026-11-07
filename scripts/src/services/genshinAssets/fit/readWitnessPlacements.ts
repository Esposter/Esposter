import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { SceneLayout } from "genshin-engine";

import { readWitnessLayout } from "#src/services/genshinAssets/fit/readWitnessLayout";

// Every mesh a component's witness layout places, the finest level of each, in three's axes round the origin, as
// `genshin:assets witness` wrote it beside the exports
export const readWitnessPlacements = async (component: DerivedAssetComponent): Promise<SceneLayout["placements"]> =>
  (await readWitnessLayout(component)).placements;
