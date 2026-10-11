import type { ActiveKitStepContext } from "#src/models/kit/ActiveKitStepContext";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { FISCHL_CHARACTER_ID } from "#src/services/kit/characters/fischlKit";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { createKitState } from "#src/services/kit/createKitState";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { stepActiveKit } from "#src/services/kit/stepActiveKit";
import { createParty } from "#src/services/party/createParty";
import { damagePartyMember } from "#src/services/party/damagePartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
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
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

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

// The context the kit on the field steps in with an enemy standing in its strikes' reach
const createStrikeContext = (combatants: Combatant[], kitEffectState?: KitEffectState): ActiveKitStepContext => ({
  ...createContext(combatants, kitEffectState),
  enemyMap: new Map([["", { ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), position: { x: 0, z: -1 } }]]),
  enemyTables,
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

  test("sends the team's kits a burst as it starts, with the member that used it and its energy cost", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const context = createContext([createCombatant(TRAVELER_CHARACTER_ID, { ...TRAVELER_KIT, onKitEvent })]);
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy = TRAVELER_KIT.burstEnergyCost;
    stepActiveKit(createKitState(), { ...IDLE_INPUT, isBurstPressed: true }, 0.1, context);

    expect(onKitEvent.mock.calls.map(([event]) => event)).toStrictEqual([
      { characterId: TRAVELER_CHARACTER_ID, energyCost: TRAVELER_KIT.burstEnergyCost, kind: KitEventKind.BurstUsed },
    ]);
  });

  test("sends the team's kits each change to a member's HP since the last step, once", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const context = createContext([createCombatant(TRAVELER_CHARACTER_ID, { ...TRAVELER_KIT, onKitEvent })]);
    damagePartyMember(context.party, TRAVELER_CHARACTER_ID, 0.25);
    const kitState = createKitState();
    stepActiveKit(kitState, IDLE_INPUT, 0.1, context);
    stepActiveKit(kitState, IDLE_INPUT, 0.1, context);

    expect(onKitEvent.mock.calls.map(([event]) => event)).toStrictEqual([
      {
        characterId: TRAVELER_CHARACTER_ID,
        healthShare: -0.25,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
      },
    ]);
  });

  test("plays a stance's actions in place of the kit's while the stance holds", () => {
    expect.hasAssertions();
    const stanceAttack: KitAction = { ...takeOne(TRAVELER_KIT.normalAttacks) };
    const context = createContext([createCombatant(TRAVELER_CHARACTER_ID, TRAVELER_KIT)], {
      effects: [
        {
          actions: { ...TRAVELER_KIT, normalAttacks: [stanceAttack] },
          attackTags: {
            chargedAttack: AttackTag.ChargedAttack,
            elementalBurst: AttackTag.ElementalBurst,
            elementalSkill: AttackTag.ElementalSkill,
            normalAttacks: AttackTag.NormalAttack,
          },
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

  describe("a hit whose hitmark falls past its action's end", () => {
    // A strike whose one hit lands at twice the seconds it plays for
    const lateAttack: KitAction = { ...takeOne(TRAVELER_KIT.normalAttacks) };
    const lateHit = takeOne(lateAttack.hits);
    lateAttack.seconds = lateHit.hitmarkSeconds / 2;

    test("lands at its hitmark after the action has ended, as its kind of attack and infused as it lands", () => {
      expect.hasAssertions();
      const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
      const kit: Kit = { ...TRAVELER_KIT, normalAttacks: [lateAttack], onKitEvent };
      const context = createStrikeContext([createCombatant(TRAVELER_CHARACTER_ID, kit)], {
        effects: [{ characterId: TRAVELER_CHARACTER_ID, element: Element.Cryo, kind: "infusion", secondsRemaining: 1 }],
      });
      // A landing's action or its kind of attack and element, the one its event carries
      const readLandings = () =>
        onKitEvent.mock.calls.flatMap(
          ([event]): { action?: KitAction; attackTag?: AttackTag; element?: Element; kind: KitEventKind }[] => {
            if (event.kind === KitEventKind.NormalAttackLanded) return [{ action: event.action, kind: event.kind }];
            if (event.kind === KitEventKind.DamageTaken)
              return [{ attackTag: event.attackTag, element: event.hit.element, kind: event.kind }];
            return [];
          },
        );
      const kitState = createKitState();
      stepActiveKit(kitState, { ...IDLE_INPUT, isAttackPressed: true }, lateAttack.seconds, context);
      stepActiveKit(kitState, IDLE_INPUT, lateAttack.seconds, context);

      expect(kitState.action).toBeUndefined();
      expect(readLandings()).toStrictEqual([]);

      stepActiveKit(kitState, IDLE_INPUT, lateAttack.seconds, context);

      expect(readLandings()).toStrictEqual([
        { action: lateAttack, kind: KitEventKind.NormalAttackLanded },
        { attackTag: AttackTag.NormalAttack, element: Element.Cryo, kind: KitEventKind.DamageTaken },
      ]);
    });

    test("lands after a swap, priced by the character that played it", () => {
      expect.hasAssertions();
      const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
      const lateCombatant = createCombatant(TRAVELER_CHARACTER_ID, {
        ...TRAVELER_KIT,
        normalAttacks: [lateAttack],
        onKitEvent,
      });
      const context = createStrikeContext([lateCombatant, createCombatant(FISCHL_CHARACTER_ID, TRAVELER_KIT)]);
      const kitState = createKitState();
      stepActiveKit(kitState, { ...IDLE_INPUT, isAttackPressed: true }, lateAttack.seconds, context);
      stepActiveKit(kitState, IDLE_INPUT, lateAttack.seconds, context);
      context.party.activeIndex = 1;
      stepActiveKit(createKitState(), IDLE_INPUT, lateAttack.seconds, context);

      expect(
        onKitEvent.mock.calls.flatMap(([event]) =>
          event.kind === KitEventKind.DamageTaken ? [{ hit: event.hit, striker: event.striker }] : [],
        ),
      ).toStrictEqual([{ hit: lateHit, striker: lateCombatant }]);
    });
  });
});
