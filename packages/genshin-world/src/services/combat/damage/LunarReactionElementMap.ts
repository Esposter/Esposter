import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";

// The element each Lunar reaction's own hit is dealt in, against the enemy's RES to which
export const LunarReactionElementMap: Record<LunarReactionType, Element> = {
  [LunarReactionType.LunarBloom]: Element.Dendro,
  [LunarReactionType.LunarCharged]: Element.Electro,
  [LunarReactionType.LunarCrystallize]: Element.Geo,
};
