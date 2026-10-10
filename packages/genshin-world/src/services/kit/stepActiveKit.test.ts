import type { ActiveKitStepContext } from "#src/models/kit/ActiveKitStepContext";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { FISCHL_CHARACTER_ID, TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { createKitState } from "#src/services/kit/createKitState";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { stepActiveKit } from "#src/services/kit/stepActiveKit";
import { createParty } from "#src/services/party/createParty";
import { noop, takeOne } from "@esposter/shared";
import {
  createCharacterController,
  createGroundQuery,
  createLandmarkCollider,
  LocomotionState,
  STAMINA_MAX,
} from "genshin-engine";
import { Vector3 } from "three";
import { describe, expect, test, vi } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

const createCombatant = (characterId: number, kit: Kit): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit,
  level: 90,
});

// The context the kit on the field steps in, its party the characters given with the first on the field
const createContext = (
  combatants: Combatant[],
  kitEffectState: KitEffectState = { effects: [] },
): ActiveKitStepContext => ({
  aimYaw: 0,
  characterController: createCharacterController({
    ground: createGroundQuery(() => 0, -1),
    landmarkCollider: createLandmarkCollider(),
    position: new Vector3(),
    staminaMaximum: STAMINA_MAX,
  }),
  characterIdCombatantMap: new Map(combatants.map((combatant) => [combatant.characterId, combatant])),
  enemyMap: new Map(),
  enemyTables: { enemyKindMap: new Map(), enemyLevelCurves: {} },
  isAimHeld: false,
  kitEffectState,
  landedHits: [],
  party: createParty(combatants.map(({ characterId }) => characterId)),
  random: () => 0,
  strikeOre: noop,
});

describe(stepActiveKit, () => {
  const IDLE_INPUT: KitInput = {
    height: 0,
    isAttackHeld: false,
    isAttackPressed: false,
    isBurstPressed: false,
    isSkillHeld: false,
    isSkillPressed: false,
    locomotionState: LocomotionState.Idle,
  };

  test("plays no action while the character on the field has no combatant", () => {
    expect.hasAssertions();
    const kitState = createKitState();
    stepActiveKit(kitState, { ...IDLE_INPUT, isAttackPressed: true }, 0.1, {
      ...createContext([createCombatant(TRAVELER_CHARACTER_ID, TRAVELER_KIT)]),
      characterIdCombatantMap: new Map(),
    });

    expect(kitState).toStrictEqual(createKitState());
  });

  test("sends the team's kits a swap, an effect that runs out and a normal attack that lands", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const offFieldCombatant = createCombatant(FISCHL_CHARACTER_ID, { ...TRAVELER_KIT, onKitEvent });
    const status: KitStatus = { characterId: FISCHL_CHARACTER_ID, id: "", kind: "status", secondsRemaining: 0 };
    const context = createContext([createCombatant(TRAVELER_CHARACTER_ID, TRAVELER_KIT), offFieldCombatant], {
      effects: [status],
      fieldCharacterId: FISCHL_CHARACTER_ID,
    });
    const kitState = createKitState();
    stepActiveKit(kitState, { ...IDLE_INPUT, isAttackPressed: true }, 0.1, context);
    stepActiveKit(kitState, IDLE_INPUT, 1, context);

    expect(onKitEvent.mock.calls.map(([event]) => event)).toStrictEqual([
      {
        characterId: TRAVELER_CHARACTER_ID,
        kind: KitEventKind.CharacterSwapped,
        previousCharacterId: FISCHL_CHARACTER_ID,
      },
      { effect: status, kind: KitEventKind.EffectExpired },
      { action: takeOne(TRAVELER_KIT.normalAttacks), kind: KitEventKind.NormalAttackLanded },
    ]);
  });

  test("plays a stance's actions in place of the kit's while the stance holds", () => {
    expect.hasAssertions();
    const stanceAttack: KitAction = { ...takeOne(TRAVELER_KIT.normalAttacks) };
    const context = createContext([createCombatant(TRAVELER_CHARACTER_ID, TRAVELER_KIT)], {
      effects: [
        {
          actions: { ...TRAVELER_KIT, normalAttacks: [stanceAttack] },
          characterId: TRAVELER_CHARACTER_ID,
          elapsedSeconds: 0,
          kind: "stance",
          secondsRemaining: 1,
        },
      ],
    });
    const kitState = createKitState();
    stepActiveKit(kitState, { ...IDLE_INPUT, isAttackPressed: true }, 0.1, context);

    expect(kitState.action).toBe(stanceAttack);
  });
});
