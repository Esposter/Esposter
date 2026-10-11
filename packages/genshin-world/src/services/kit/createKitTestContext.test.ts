import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { createParty } from "#src/services/party/createParty";
import { describe } from "vitest";

// The combat state a kit's suite runs it in: the combatant on the field, alone in the deployed team, standing at the
// Origin with no enemies, no effects, no events raised and every roll the lowest, each part replaced by the one given
export const createKitTestContext = (combatant: Combatant, context: Partial<KitContext> = {}): KitContext => ({
  activeCombatant: combatant,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  characterIdCombatantMap: new Map([[combatant.characterId, combatant]]),
  enemyMap: new Map(),
  enemyTables: { enemyKindMap: new Map(), enemyLevelCurves: {} },
  kitEffectState: { effects: [] },
  outbox: [],
  party: createParty([combatant.characterId]),
  random: () => 0,
  ...context,
});

describe.todo("createKitTestContext");
