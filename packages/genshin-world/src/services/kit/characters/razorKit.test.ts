import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { BARBARA_CHARACTER_ID } from "#src/services/kit/characters/barbaraKit";
import { createRazorKitBehaviour, RAZOR_CHARACTER_ID } from "#src/services/kit/characters/razorKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const RAZOR_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, RAZOR_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createRazorCombatant = (ascension: number, constellationCount: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: 200 }]),
  characterId: RAZOR_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: RAZOR_KIT,
  level: 90,
});

// The CRIT Rate a normal attack of Razor's gets from an enemy at a share of its health, at a constellation count
const readCriticalRateBonus = (constellationCount: number, healthShare: number): number => {
  const combatant = createRazorCombatant(0, constellationCount);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  return (
    RAZOR_KIT.getStrikeCriticalRateBonus?.(
      {
        attackTag: AttackTag.NormalAttack,
        body: createKitTestContext(combatant).body,
        combatant,
        hit: takeOne(takeOne(RAZOR_KIT.normalAttacks).hits),
      },
      { ...enemy, health: healthShare * enemy.maxHealth },
    ) ?? 0
  );
};

describe(createRazorKitBehaviour, () => {
  test("reads each talent multiplier from his proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...RAZOR_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...RAZOR_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      RAZOR_KIT.plungeCollision.talentMultiplier,
      takeOne(RAZOR_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(RAZOR_KIT.highPlunge.hits).talentMultiplier,
      takeOne(RAZOR_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(takeOne(RAZOR_KIT.elementalSkillHolds ?? []).action.hits).talentMultiplier,
      takeOne(RAZOR_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.9592, 0.8263, 1.0331, 1.3605, 0.6254, 1.1309, 0.8205, 1.6406, 2.0492, 1.992, 2.952, 1.6,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("each press gives an Electro Sigil up to three, and the hold clears them into 5 energy each at its hit", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createRazorCombatant(0, 0));
    const { kitEffectState, party } = context;
    const partyMember = getPartyMember(party, RAZOR_CHARACTER_ID);
    for (let press = 0; press < 4; press++) RAZOR_KIT.elementalSkill.onStart?.(context);

    expect(kitEffectState.effects.flatMap((effect) => (effect.kind === "buff" ? [effect.amount] : []))).toStrictEqual([
      0.2 * 3,
    ]);

    takeOne(RAZOR_KIT.elementalSkillHolds ?? []).action.onStart?.(context);
    stepKitEffects(54 / 60, context);

    expect(partyMember.energy).toBe(0);

    stepKitEffects(0.2, context);

    expect(partyMember.energy).toBe(15);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test.each([
    [0, 6],
    [1, 0],
  ])(
    "at Ascension %i, Lightning Fang's hit leaves the skill's cooldown at %i seconds",
    (ascension, cooldownSeconds) => {
      expect.hasAssertions();
      const context = createKitTestContext(createRazorCombatant(ascension, 0));
      const partyMember = getPartyMember(context.party, RAZOR_CHARACTER_ID);
      partyMember.skillCooldownSeconds = 6;
      RAZOR_KIT.elementalBurst.onStart?.(context);
      stepKitEffects(33 / 60, context);

      expect(partyMember.skillCooldownSeconds).toBe(cooldownSeconds);
    },
  );

  test("his burst clears the sigils into energy, and its Soul Companion strikes beside each strike until he leaves the field", () => {
    expect.hasAssertions();
    const combatant = createRazorCombatant(0, 0);
    const party = createParty([RAZOR_CHARACTER_ID, BARBARA_CHARACTER_ID]);
    const partyMember = getPartyMember(party, RAZOR_CHARACTER_ID);
    const context = createKitTestContext(combatant, { party });
    const { kitEffectState } = context;
    const firstStrike = takeOne(RAZOR_KIT.normalAttacks);
    RAZOR_KIT.elementalSkill.onStart?.(context);
    RAZOR_KIT.elementalSkill.onStart?.(context);
    RAZOR_KIT.elementalBurst.onStart?.(context);
    stepKitEffects(33 / 60, context);
    firstStrike.onStart?.(context);
    const soulCompanionStrikes = stepKitTestEffects(1, context);

    expect(partyMember.energy).toBe(10);
    expect(soulCompanionStrikes.map(({ hit }) => [hit.element, hit.talentMultiplier])).toStrictEqual([
      [Element.Electro, 0.24 * takeOne(firstStrike.hits).talentMultiplier],
    ]);

    // Switching Barbara in ends the Wolf Within, as the swap's kit event does, so a strike after it casts no Soul Companion
    const barbaraContext = { ...context, activeCombatant: { ...combatant, characterId: BARBARA_CHARACTER_ID } };
    RAZOR_KIT.onKitEvent?.(
      {
        characterId: BARBARA_CHARACTER_ID,
        kind: KitEventKind.CharacterSwapped,
        previousCharacterId: RAZOR_CHARACTER_ID,
      },
      barbaraContext,
      combatant,
    );
    stepKitEffects(1 / 60, barbaraContext);
    firstStrike.onStart?.(context);

    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test.each([
    [0, 1],
    [1, 0.82],
  ])("at Ascension %i, the skill's cooldown is multiplied by %f", (ascension, cooldownMultiplier) => {
    expect.hasAssertions();
    expect(RAZOR_KIT.getSkillCooldownMultiplier?.(createKitTestContext(createRazorCombatant(ascension, 0)))).toBe(
      cooldownMultiplier,
    );
  });

  test.each([
    [0, [], []],
    [
      6,
      [
        [Element.Electro, 1],
        [Element.Electro, 1],
      ],
      [0.2 * 2],
    ],
  ])(
    "with %i constellations, strikes 0, 1 and 11 seconds apart release the lightning %j and leave the sigils' Energy Recharge %j",
    (constellationCount, lightningStrikes, sigilEnergyRecharges) => {
      expect.hasAssertions();
      const context = createKitTestContext(createRazorCombatant(0, constellationCount));
      const { kitEffectState } = context;
      const firstStrike = takeOne(RAZOR_KIT.normalAttacks);
      const strikes = [1, 10, 1].flatMap((stepSeconds) => {
        firstStrike.onStart?.(context);
        return stepKitTestEffects(stepSeconds, context);
      });

      expect(strikes.map(({ hit }) => [hit.element, hit.talentMultiplier])).toStrictEqual(lightningStrikes);
      expect(kitEffectState.effects.flatMap((effect) => (effect.kind === "buff" ? [effect.amount] : []))).toStrictEqual(
        sigilEnergyRecharges,
      );
    },
  );

  test("a Constellation 2 switch adds 10% CRIT Rate to his strikes on an enemy below 30% HP", () => {
    expect.hasAssertions();

    expect(readCriticalRateBonus(2, 0.2)).toBe(0.1);
  });

  test("a Constellation 1 switch, or an enemy at 30% HP, adds no CRIT Rate to his strikes", () => {
    expect.hasAssertions();

    expect([readCriticalRateBonus(1, 0.2), readCriticalRateBonus(2, 0.3)]).toStrictEqual([0, 0]);
  });

  test("constellation 4 lowers the DEF of each enemy Claw and Thunder's press strikes by 15% for 7 seconds", () => {
    expect.hasAssertions();

    const press = takeOne(RAZOR_KIT.elementalSkill.hits);

    expect(press.enemyStatus?.(createRazorCombatant(0, 4))).toStrictEqual({
      damageTakenBonus: 0,
      defenseReduction: 0.15,
      id: "razor-constellation-4",
      secondsRemaining: 7,
    });
    expect(press.enemyStatus?.(createRazorCombatant(0, 3))).toBeUndefined();
  });

  test("claw and thunder's hold lowers no DEF at constellation 4", () => {
    expect.hasAssertions();

    const hold = takeOne(takeOne(RAZOR_KIT.elementalSkillHolds ?? []).action.hits);

    expect(hold.enemyStatus?.(createRazorCombatant(0, 4))).toBeUndefined();
  });

  test("constellation 1 raises Razor's all-DMG bonus by 10% for 8 seconds when he is on the field and a particle or orb is collected", () => {
    expect.hasAssertions();

    const combatant = createRazorCombatant(0, 1);
    const context = createKitTestContext(combatant);
    const { kitEffectState } = context;
    RAZOR_KIT.onKitEvent?.(
      {
        characterId: BARBARA_CHARACTER_ID,
        count: 1,
        energyDropKind: EnergyDropKind.Particle,
        kind: KitEventKind.EnergyParticleCollected,
      },
      context,
      combatant,
    );

    expect(
      kitEffectState.effects.flatMap((effect) =>
        effect.kind === "buff" ? [[effect.attribute, effect.amount, effect.secondsRemaining]] : [],
      ),
    ).toStrictEqual([[Attribute.AllDamageBonus, 0.1, 8]]);
  });

  test("a particle pickup raises no all-DMG bonus while another character is on the field", () => {
    expect.hasAssertions();

    const combatant = createRazorCombatant(0, 1);
    const context = {
      ...createKitTestContext(combatant),
      activeCombatant: { ...combatant, characterId: BARBARA_CHARACTER_ID },
    };
    const { kitEffectState } = context;
    RAZOR_KIT.onKitEvent?.(
      {
        characterId: BARBARA_CHARACTER_ID,
        count: 1,
        energyDropKind: EnergyDropKind.Particle,
        kind: KitEventKind.EnergyParticleCollected,
      },
      context,
      combatant,
    );

    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("a particle pickup raises no all-DMG bonus before Constellation 1", () => {
    expect.hasAssertions();

    const combatant = createRazorCombatant(0, 0);
    const context = createKitTestContext(combatant);
    const { kitEffectState } = context;
    RAZOR_KIT.onKitEvent?.(
      {
        characterId: BARBARA_CHARACTER_ID,
        count: 1,
        energyDropKind: EnergyDropKind.Particle,
        kind: KitEventKind.EnergyParticleCollected,
      },
      context,
      combatant,
    );

    expect(kitEffectState.effects).toStrictEqual([]);
  });
});
