import { GameTextKey } from "genshin-text";

// The refusal line the blacksmith gives an order past the day's forge points, by the enhancement ore the recipe yields, in
// The game's own words for each ore
export const ForgeRefusalGameTextKeyMap: Record<number, GameTextKey> = {
  104_011: GameTextKey.ForgeEnhancementOreRefusal,
  104_012: GameTextKey.ForgeFineEnhancementOreRefusal,
  104_013: GameTextKey.ForgeMysticEnhancementOreRefusal,
};
