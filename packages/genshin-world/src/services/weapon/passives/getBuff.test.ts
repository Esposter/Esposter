import type { Attribute } from "#src/models/character/Attribute";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { describe } from "vitest";

// The buff an attribute has among a kit's effects, if it has one
export const getBuff = (kitEffectState: KitEffectState, attribute: Attribute): KitBuff | undefined =>
  kitEffectState.effects.find((effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === attribute);

describe.todo("getBuff");
