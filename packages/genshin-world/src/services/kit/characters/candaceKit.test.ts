import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitField } from "#src/models/kit/KitField";
import type { KitInfusion } from "#src/models/kit/KitInfusion";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { CANDACE_CHARACTER_ID, createCandaceKitBehaviour } from "#src/services/kit/characters/candaceKit";
import { KUKI_CHARACTER_ID } from "#src/services/kit/characters/kukiKit";
import { createKitState } from "#src/services/kit/createKitState";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { stepKit } from "#src/services/kit/stepKit";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const CANDACE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CANDACE_CHARACTER_ID);
const countSummons = (kitEffectState: KitEffectState): number =>
  kitEffectState.effects.filter((effect) => effect.kind === "summon").length;

const swapTo = (kitEffectState: KitEffectState, combatant: Combatant, incoming: Combatant): void =>
  CANDACE_KIT.onKitEvent?.(
    {
      characterId: incoming.characterId,
      kind: KitEventKind.CharacterSwapped,
      previousCharacterId: CANDACE_CHARACTER_ID,
    },
    createKitTestContext(combatant, {
      characterIdCombatantMap: new Map([
        [combatant.characterId, combatant],
        [incoming.characterId, incoming],
      ]),
      kitEffectState,
    }),
    combatant,
  );

// A hit a party member's elemental normal attack lands on an enemy, as the event reports it
const createNormalAttackDamageTaken = (striker: Combatant): KitDamageTakenEvent => ({
  attackTag: AttackTag.NormalAttack,
  enemy: { ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), position: { x: 0, z: 0 } },
  hit: { ...takeOne(takeOne(CANDACE_KIT.normalAttacks).hits), element: Element.Hydro },
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken,
  striker,
});

describe(createCandaceKitBehaviour, () => {
  // The seconds the Prayer of the Crimson Crown stands once the burst is cast by a combatant of the given constellations
  const getPrayerSeconds = (constellationCount: number): number | undefined =>
    castAction(CANDACE_KIT.elementalBurst, createCandaceCombatant(constellationCount)).effects.find(
      (effect): effect is KitField => effect.kind === "field",
    )?.secondsRemaining;

  // The effects an action's start adds to the team's, which its owner holds
  const castAction = (action: KitAction, combatant = createCandaceCombatant()): KitEffectState => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    return kitEffectState;
  };

  const createCandaceCombatant = (constellationCount = 0): Combatant =>
    createCombatant(CANDACE_CHARACTER_ID, WeaponType.Polearm, constellationCount);

  const createCombatant = (characterId: number, weaponType: WeaponType, constellationCount = 0): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
    characterId,
    constellationCount,
    elementalResonances: [],
    kit: CANDACE_KIT,
    level: 90,
    weaponType,
  });

  const MAX_HEALTH = 10_000;

  test("reads the strikes', charged attack's and plunges' multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...CANDACE_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(CANDACE_KIT.chargedAttack.hits).talentMultiplier,
      CANDACE_KIT.plungeCollision.talentMultiplier,
      takeOne(CANDACE_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(CANDACE_KIT.highPlunge.hits).talentMultiplier,
    ];

    expect(multipliers).toStrictEqual([
      0.60802, 0.61146, 0.354879, 0.433741, 0.94944, 1.24184, 0.639324, 1.278377, 1.596762,
    ]);
  });

  test("the charged attack costs 25 stamina, and her burst costs 60 energy and cools for 15 seconds", () => {
    expect.hasAssertions();

    expect({
      burstCooldownSeconds: CANDACE_KIT.burstCooldownSeconds,
      burstEnergyCost: CANDACE_KIT.burstEnergyCost,
      chargedAttackStamina: CANDACE_KIT.chargedAttackStamina,
      skillCooldownSeconds: CANDACE_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 25,
      skillCooldownSeconds: 6,
    });
  });

  test("a tap's shield is her shield share of Max HP and its flat HP, and lasts until the tap's hit at 16 frames", () => {
    expect.hasAssertions();
    const shield = castAction(CANDACE_KIT.elementalSkill).effects.find(
      (effect): effect is KitShield => effect.kind === "shield",
    );

    expect({ health: shield?.health, secondsRemaining: shield?.secondsRemaining }).toStrictEqual({
      health: 1155.5629 + 0.12 * MAX_HEALTH,
      secondsRemaining: 16 / 60,
    });
  });

  test("a charged hold is held for 0.5 seconds, cools for nine, and its shield lasts until its hit at 91 frames", () => {
    expect.hasAssertions();
    const [hold] = CANDACE_KIT.elementalSkillHolds ?? [];
    const shield = castAction(hold?.action ?? CANDACE_KIT.elementalSkill).effects.find(
      (effect): effect is KitShield => effect.kind === "shield",
    );

    expect({
      cooldownSeconds: hold?.cooldownSeconds,
      hitmarkSeconds: takeOne(hold?.action.hits ?? []).hitmarkSeconds,
      minimumHeldSeconds: hold?.minimumHeldSeconds,
      shieldSeconds: shield?.secondsRemaining,
    }).toStrictEqual({ cooldownSeconds: 9, hitmarkSeconds: 91 / 60, minimumHeldSeconds: 0.5, shieldSeconds: 91 / 60 });
  });

  test("the Prayer of the Crimson Crown stands 9 seconds from its 33-frame hitmark, and 3 seconds longer from Constellation 1", () => {
    expect.hasAssertions();
    expect({ base: getPrayerSeconds(0), constellation1: getPrayerSeconds(1) }).toStrictEqual({
      base: 33 / 60 + 9,
      constellation1: 33 / 60 + 9 + 3,
    });
  });

  test("the Prayer's tick infuses the party member on the field with Hydro only if it wields a sword, claymore or polearm", () => {
    expect.hasAssertions();
    const combatant = createCandaceCombatant();
    const swordMember = createCombatant(KUKI_CHARACTER_ID, WeaponType.Sword);
    const bowMember = createCombatant(KUKI_CHARACTER_ID + 1, WeaponType.Bow);
    const kitEffectState = castAction(CANDACE_KIT.elementalBurst, combatant);
    const prayer = kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
    for (const activeCombatant of [swordMember, bowMember])
      prayer?.onTick(
        createKitTestContext(activeCombatant, {
          characterIdCombatantMap: new Map(),
          kitEffectState,
          party: createParty([CANDACE_CHARACTER_ID]),
        }),
        0,
      );
    const infusions = kitEffectState.effects.filter((effect): effect is KitInfusion => effect.kind === "infusion");

    expect(infusions.map(({ characterId, element }) => ({ characterId, element }))).toStrictEqual([
      { characterId: KUKI_CHARACTER_ID, element: Element.Hydro },
    ]);
  });

  test("each swap while the Prayer stands sets a wave off round the body, three at most, and infuses the one coming on", () => {
    expect.hasAssertions();
    const combatant = createCandaceCombatant();
    const swordMember = createCombatant(KUKI_CHARACTER_ID, WeaponType.Sword);
    const kitEffectState = castAction(CANDACE_KIT.elementalBurst, combatant);
    for (let swap = 0; swap < 4; swap++) swapTo(kitEffectState, combatant, swordMember);
    const wave = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect({
      infusedCharacterIds: kitEffectState.effects
        .filter((effect): effect is KitInfusion => effect.kind === "infusion")
        .map(({ characterId }) => characterId),
      waves: countSummons(kitEffectState),
      waveShare: takeOne(wave?.hits ?? []).additiveBaseDamageBonus?.(combatant),
    }).toStrictEqual({ infusedCharacterIds: [KUKI_CHARACTER_ID], waves: 3, waveShare: MAX_HEALTH * 0.066104 });
  });

  test("constellation 6 sets off a wave on a party member's elemental normal attack, once every 2.3 seconds", () => {
    expect.hasAssertions();
    const combatant = createCandaceCombatant(6);
    const swordMember = createCombatant(KUKI_CHARACTER_ID, WeaponType.Sword);
    const kitEffectState = castAction(CANDACE_KIT.elementalBurst, combatant);
    const landAttack = (): void =>
      CANDACE_KIT.onKitEvent?.(
        createNormalAttackDamageTaken(swordMember),
        createKitTestContext(combatant, {
          activeCombatant: swordMember,
          characterIdCombatantMap: new Map([
            [combatant.characterId, combatant],
            [swordMember.characterId, swordMember],
          ]),
          kitEffectState,
        }),
        combatant,
      );
    landAttack();
    const afterFirst = countSummons(kitEffectState);
    landAttack();

    expect({ afterFirst, afterSecond: countSummons(kitEffectState) }).toStrictEqual({ afterFirst: 1, afterSecond: 1 });
  });

  // Candace's combatant at an ascension, holding her skill for two steps with the given event heard after the first, and
  // Released: the action the release starts, which is her charged hold when its charge is complete
  const CHARGED_ACTION = CANDACE_KIT.elementalSkillHolds?.at(-1)?.action;
  const STEP_SECONDS = 0.1;
  const IDLE_INPUT: KitInput = {
    height: 0,
    isAttackHeld: false,
    isAttackPressed: false,
    isBurstPressed: false,
    isSkillHeld: false,
    isSkillPressed: false,
    locomotionState: LocomotionState.Idle,
  };
  const releaseHeldSkill = (ascension: number, createEvent: (combatant: Combatant) => KitEvent) => {
    const combatant: Combatant = {
      ascension,
      attributes: computeCharacterAttributes([]),
      characterId: CANDACE_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: CANDACE_KIT,
      level: 90,
      weaponType: WeaponType.Polearm,
    };
    const context = createKitTestContext(combatant);
    const kitState = createKitState();
    const partyMember = createPartyMember();
    const stamina = createStamina(STAMINA_MAX);
    const hold = { ...IDLE_INPUT, isSkillHeld: true };
    stepKit(kitState, CANDACE_KIT, hold, partyMember, stamina, STEP_SECONDS, [], context);
    CANDACE_KIT.onKitEvent?.(createEvent(combatant), context, combatant);
    stepKit(kitState, CANDACE_KIT, hold, partyMember, stamina, STEP_SECONDS, [], context);
    return stepKit(kitState, CANDACE_KIT, IDLE_INPUT, partyMember, stamina, STEP_SECONDS, [], context);
  };
  // An enemy's strike that takes a share of Candace's HP, and the same strike on another member of the team
  const strikeOnCandace = (): KitEvent => ({
    bondOfLifeShare: 0,
    characterId: CANDACE_CHARACTER_ID,
    healthShare: -0.1,
    kind: KitEventKind.HealthChanged,
    overflowHealthShare: 0,
  });
  const strikeOnKuki = (): KitEvent => ({
    bondOfLifeShare: 0,
    characterId: KUKI_CHARACTER_ID,
    healthShare: -0.1,
    kind: KitEventKind.HealthChanged,
    overflowHealthShare: 0,
  });

  test("the Ascension 1 passive, Aegis of Crossed Arrows, takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(CHARGED_ACTION).toBeDefined();
    expect(releaseHeldSkill(1, strikeOnCandace)).toBe(CHARGED_ACTION);
  });

  test("the Ascension 1 passive, Aegis of Crossed Arrows, does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    const action = releaseHeldSkill(0, strikeOnCandace);
    expect(action).toBeDefined();
    expect(action).not.toBe(CHARGED_ACTION);
  });

  test("a strike on another member of the team does not complete Candace's charge", () => {
    expect.hasAssertions();

    const action = releaseHeldSkill(1, strikeOnKuki);
    expect(action).toBeDefined();
    expect(action).not.toBe(CHARGED_ACTION);
  });

  test("a strike her shield takes completes her charge too, as the shield absorbs it on her", () => {
    expect.hasAssertions();

    expect(
      releaseHeldSkill(1, () => ({
        amount: 100,
        characterId: CANDACE_CHARACTER_ID,
        kind: KitEventKind.ShieldAbsorbed,
        struckCharacterId: CANDACE_CHARACTER_ID,
      })),
    ).toBe(CHARGED_ACTION);
  });
});
