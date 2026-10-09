import { GameTextKey } from "genshin-text";

// The game's own name for each combine type's tab on the bench, by the combine type the recipe table files it under
export const CombineTypeGameTextKeyMap: Record<number, GameTextKey> = {
  1: GameTextKey.CombineTypeEnhancement,
  2: GameTextKey.CombineTypeWeaponAscension,
  3: GameTextKey.CombineTypeCharacterTalent,
  4: GameTextKey.CombineTypePotion,
  5: GameTextKey.CombineTypeCharacterAscension,
  6: GameTextKey.CombineTypeConsumable,
  10: GameTextKey.CombineTypeBait,
  12: GameTextKey.CombineTypeFood,
};
