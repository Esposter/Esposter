import type { DerivedAssetFit } from "#src/models/genshinAssets/fit/DerivedAssetFit";

import { fitWeaponIcons } from "#src/services/genshinAssets/fit/fitWeaponIcons";
import { runFits } from "#src/services/genshinAssets/fit/runFits";

// The weapons' fit: the outlines of their icons, and the fits that follow them, each by the record it publishes
export const fitWeaponShapes: DerivedAssetFit = (only, options) => runFits([["icons", fitWeaponIcons]], only, options);
