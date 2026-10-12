import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";

// The element each Lunar reaction's own hit is dealt in, the element whose RES on the enemy it is checked against
export const LunarReactionElementMap: Record<LunarReactionType, Element> = {
  [LunarReactionType.LunarBloom]: Element.Dendro,
  [LunarReactionType.LunarCharged]: Element.Electro,
  [LunarReactionType.LunarCrystallize]: Element.Geo,
};
