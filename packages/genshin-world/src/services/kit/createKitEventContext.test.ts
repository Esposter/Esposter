import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEventContext } from "#src/models/kit/KitEventContext";

import { createParty } from "#src/services/party/createParty";
import { describe } from "vitest";

// The context an event reaches a kit with: its own combatant on the field, alone in the deployed team, standing at the
// Origin with no enemies, no effects and every roll the lowest, each part replaced by the one given
export const createKitEventContext = (
  combatant: Combatant,
  context: Partial<KitEventContext> = {},
): KitEventContext => ({
  activeCombatant: combatant,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  combatant,
  enemyMap: new Map(),
  kitEffectState: { effects: [] },
  party: createParty([combatant.characterId]),
  random: () => 0,
  ...context,
});

describe.todo("createKitEventContext");
