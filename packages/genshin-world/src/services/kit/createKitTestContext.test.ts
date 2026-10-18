import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { countKitHexereiMembers } from "#src/services/kit/countKitHexereiMembers";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { createParty } from "#src/services/party/createParty";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
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
  locomotionState: LocomotionState.Idle,
  hexereiCount: countKitHexereiMembers([combatant.characterId]),
  stamina: createStamina(STAMINA_MAX),
  oreStrikes: [],
  reactionTriggers: [],
  outbox: [],
  party: createParty([combatant.characterId]),
  placeWildlifeDrops: () => undefined,
  random: () => 0,
  strikes: [],
  wildlifeList: [],
  ...context,
});

// The given seconds stepped through the team's effects at the world's fixed step
export const stepKitSeconds = (context: KitContext, seconds: number) => {
  for (let stepIndex = 0; stepIndex < Math.round(seconds / FIXED_STEP_SECONDS); stepIndex++)
    stepKitEffects(FIXED_STEP_SECONDS, context);
};

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
