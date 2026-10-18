import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { takeOne } from "@esposter/shared";

// Whether the character a card is attached to is the active one, the one whose skills and played cards the side pays for. A
// Card whose text is about its own holder reduces a cost only then, since the cost-card lister reads every character's cards
export const checkIsGcgActiveHolder = (context: GcgEffectContext): boolean =>
  context.characterIndex !== undefined &&
  context.characterIndex === takeOne(context.duel.sides, context.sideIndex).activeIndex;
