import type { Reaction } from "#src/models/combat/Reaction";
import type { ElementalMonument } from "#src/models/puzzle/ElementalMonument";

import { advanceElementalState } from "#src/services/combat/aura/advanceElementalState";
import { ELEMENTAL_MONUMENT_LIT_SECONDS } from "#src/services/puzzle/constants";
import { lightElementalMonument } from "#src/services/puzzle/lightElementalMonument";

// A monument's elemental state moved on the fixed step, its auras decaying and its reactions, such as a Burning tick's
// Pyro, lighting it as a strike would. A timed monument that is not struck again goes out once its time has passed
export const stepElementalMonument = (monument: ElementalMonument, deltaSeconds: number): void => {
  const reactions: Reaction[] = [];
  advanceElementalState(monument.elementalState, deltaSeconds, reactions);
  if (reactions.some((reaction) => reaction.element === monument.element)) lightElementalMonument(monument);
  else if (
    monument.isTimed &&
    monument.isLit &&
    monument.elementalState.seconds - monument.litSeconds >= ELEMENTAL_MONUMENT_LIT_SECONDS
  )
    monument.isLit = false;
};
