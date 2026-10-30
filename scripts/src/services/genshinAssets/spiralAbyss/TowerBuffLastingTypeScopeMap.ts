import type { AbyssBenedictionChoice } from "genshin-world";

import { TowerBuffLastingType } from "#src/models/genshinAssets/spiralAbyss/TowerBuffLastingType";
import { AbyssBenedictionScope } from "genshin-world";

// The span a Benediction lasts, by the lasting type its tower buff row names. The immediate lasting type has no span
// The published record holds, so it has no entry and its Benediction publishes no scope
export const TowerBuffLastingTypeScopeMap: Partial<
  Record<TowerBuffLastingType, NonNullable<AbyssBenedictionChoice["scope"]>>
> = {
  [TowerBuffLastingType.Floor]: AbyssBenedictionScope.Floor,
  [TowerBuffLastingType.Level]: AbyssBenedictionScope.Chamber,
};
