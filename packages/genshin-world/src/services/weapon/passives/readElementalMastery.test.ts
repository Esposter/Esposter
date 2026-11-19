import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { describe } from "vitest";

// The Elemental Mastery a wielder has on the team's effects, as a hit prices it
export const readElementalMastery = (context: KitContext, wielder: Combatant): number =>
  getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap).attributes
    .attributeTotalMap[Attribute.ElementalMastery];

describe.todo("readElementalMastery");
