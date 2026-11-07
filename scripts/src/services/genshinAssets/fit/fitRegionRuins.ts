import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { createRegionHullsFit } from "#src/services/genshinAssets/fit/fitRegionHulls";

// A ruin object's mesh, of the families `Area_Common_Build_Ruin_` and `Area_Common_Build_Pillar_`: a ruin's walls, floors
// And columns, and the pillars the game stands among them. Its shadow-casting copy, which the witness lays beside each
// Mesh, is not drawn apart from it
const RUIN_MESH_REGEX = /^Area_Common_Build_(?:Ruin|Pillar)_/u;
const SHADOW_MESH_REGEX = /ShadowMesh/u;

export const checkIsRuinMesh = (mesh: string): boolean => RUIN_MESH_REGEX.test(mesh) && !SHADOW_MESH_REGEX.test(mesh);

// A region's ruins fit, published as the region's own record, `regions/<region>/ruins`, beside its rocks. The four-kind
// Desert ruin model and its generator are the record's consumer's to replace, in the Sumeru change
export const createRegionRuinsFit = (region: DerivedAssetComponent): (() => Promise<GameDataBuild>) =>
  createRegionHullsFit(region, "ruins", checkIsRuinMesh);
