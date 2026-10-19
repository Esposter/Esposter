import type { Attribute } from "#src/models/character/Attribute";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { describe } from "vitest";

// The amounts of every buff of an attribute the effects hold, in the order they were added
export const getBuffAmounts = (kitEffectState: KitEffectState, attribute: Attribute): number[] =>
  kitEffectState.effects
    .filter((effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === attribute)
    .map(({ amount }) => amount);

describe.todo("getBuffAmounts");
