import type { DerivedAssetFit } from "#src/models/genshinAssets/fit/DerivedAssetFit";

import { fitWeaponIcons } from "#src/services/genshinAssets/fit/fitWeaponIcons";
import { fitWeaponMeshMap } from "#src/services/genshinAssets/fit/fitWeaponMeshMap";
import { runFits } from "#src/services/genshinAssets/fit/runFits";

// The weapons' fit: the outlines of their icons and the pairing of each weapon row with its held mesh, and the fits that
// Follow them, each by the record it publishes
export const fitWeaponShapes: DerivedAssetFit = (only, options) =>
  runFits(
    [
      ["icons", fitWeaponIcons],
      ["meshMap", fitWeaponMeshMap],
    ],
    only,
    options,
  );
