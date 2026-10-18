import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { createParty } from "#src/services/party/createParty";
import { describe } from "vitest";

// The combat state a kit's suite runs it in: the combatant on the field, alone in the deployed team, standing at the
// Origin with no enemies or animals, no effects, no events raised and every roll the lowest, each part replaced by the
// One given
export const createKitTestContext = (combatant: Combatant, context: Partial<KitContext> = {}): KitContext => ({
  activeCombatant: combatant,
  body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
  characterIdCombatantMap: new Map([[combatant.characterId, combatant]]),
  enemyMap: new Map(),
  enemyTables: { enemyKindMap: new Map(), enemyLevelCurves: {} },
  expiredEffects: [],
  kitEffectState: { effects: [] },
  oreStrikes: [],
  outbox: [],
  party: createParty([combatant.characterId]),
  placeWildlifeDrops: () => undefined,
  random: () => 0,
  strikes: [],
  wildlifeList: [],
  ...context,
});

// The effects an action's start adds to the kit's state, which the action is run in and returned
export const castKitAction = (
  action: KitAction,
  combatant: Combatant,
  kitEffectState: KitEffectState = { effects: [] },
): KitEffectState => {
  action.onStart?.(createKitTestContext(combatant, { kitEffectState }));
  return kitEffectState;
};

describe.todo("createKitTestContext");
