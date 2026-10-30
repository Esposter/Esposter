import type { AbyssBenedictionChoice } from "genshin-world";

import { TowerBuffIcon } from "#src/models/genshinAssets/spiralAbyss/TowerBuffIcon";
import { AbyssBenedictionIcon } from "genshin-world";

// The glyph a Benediction's card draws, by the icon its tower buff row names. The Life icon has no glyph in the published
// Record, so it has no entry and its Benediction publishes no icon
export const TowerBuffIconIconMap: Partial<Record<TowerBuffIcon, NonNullable<AbyssBenedictionChoice["icon"]>>> = {
  [TowerBuffIcon.Attack]: AbyssBenedictionIcon.Sword,
  [TowerBuffIcon.Defense]: AbyssBenedictionIcon.Shield,
};
