import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { KAEYA_CHARACTER_ID } from "#src/services/kit/characters/kaeyaKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { healKitStriker } from "#src/services/kit/effects/healKitStriker";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KAEYA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, KAEYA_CHARACTER_ID);
const createKaeyaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: KAEYA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KAEYA_KIT,
  level: 90,
});

// The CRIT Rate bonus a strike of the given tag gets against an enemy carrying the given auras
const getCriticalRateBonus = (attackTag: AttackTag, auras: AuraType[], constellationCount: number): number => {
  const combatant: Combatant = { ...createKaeyaCombatant(), constellationCount };
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  for (const aura of auras) enemy.elementalState.auras.set(aura, { decayRate: 0, gauge: 1, isImmutable: false });
  return (
    KAEYA_KIT.getStrikeCriticalRateBonus?.(
      {
        attackTag,
        body: createKitTestContext(combatant).body,
        combatant,
        hit: takeOne(takeOne(KAEYA_KIT.normalAttacks).hits),
      },
      enemy,
      createParty([KAEYA_CHARACTER_ID]),
      [],
    ) ?? 0
  );
};

// A drain of Kaeya's HP that leaves him at the given share of his Max HP, as the party reports it to his kit
const drainKaeya = (combatant: Combatant, context: KitContext, remainingHealthShare: number) => {
  getPartyMember(context.party, KAEYA_CHARACTER_ID).healthShare = remainingHealthShare;
  KAEYA_KIT.onKitEvent?.(
    {
      characterId: KAEYA_CHARACTER_ID,
      healthShare: -0.25,
      bondOfLifeShare: 0,
      kind: KitEventKind.HealthChanged,
      overflowHealthShare: 0,
    },
    context,
    combatant,
  );
};

const getShields = (kitEffectState: KitEffectState) => kitEffectState.effects.filter(({ kind }) => kind === "shield");

const getSummons = (kitEffectState: KitEffectState) =>
  kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon");

// An enemy Kaeya's team defeats with a strike, as the kit hears it
const defeatEnemy = (combatant: Combatant, context: KitContext) =>
  KAEYA_KIT.onKitEvent?.(
    {
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      kind: KitEventKind.EnemyDefeated,
      striker: combatant,
    },
    context,
    combatant,
  );

describe("kaeya kit", () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...KAEYA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...KAEYA_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      KAEYA_KIT.plungeCollision.talentMultiplier,
      takeOne(KAEYA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(KAEYA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(KAEYA_KIT.elementalSkill.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.5375, 0.5169, 0.6527, 0.7086, 0.8824, 0.5504, 0.731, 0.6393, 1.2784, 1.5968, 1.912];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("its Glacial Waltz icicles land thirteen Cryo ticks at the wiki's 77.6%, and end with the summon", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createKaeyaCombatant());
    KAEYA_KIT.elementalBurst.onStart?.(context);

    const icicles = stepKitTestEffects(9, context);
    expect(icicles).toHaveLength(13);
    expect(icicles.every(({ hit }) => hit.talentMultiplier === 0.776 && hit.element === "Ice")).toBe(true);
    expect(context.kitEffectState.effects).toStrictEqual([]);
  });

  test("ascension 1 heals Kaeya by 15% of his ATK for each enemy Frostgnaw strikes, and gives none before it", () => {
    expect.hasAssertions();
    const hit = takeOne(KAEYA_KIT.elementalSkill.hits);
    const combatant: Combatant = {
      ...createKaeyaCombatant(),
      ascension: 1,
      attributes: computeCharacterAttributes([
        { attribute: Attribute.BaseHealth, value: 10_000 },
        { attribute: Attribute.BaseAttack, value: 1000 },
      ]),
      constellationCount: 0,
    };
    const party = createParty([KAEYA_CHARACTER_ID]);
    const partyMember = getPartyMember(party, KAEYA_CHARACTER_ID);
    partyMember.healthShare = 0.5;

    healKitStriker(createKitTestContext(combatant, { party }), combatant, combatant, hit);
    expect(partyMember.healthShare).toBeCloseTo(
      0.5 + (0.15 * combatant.attributes.attack) / combatant.attributes.maxHealth,
      5,
    );
    expect(hit.healAttackShare?.({ ...combatant, ascension: 0 })).toBe(0);
  });

  test("constellation 1 raises the CRIT Rate of his Normal and Charged Attacks by 15% against Cryo-affected enemies", () => {
    expect.hasAssertions();
    expect([
      getCriticalRateBonus(AttackTag.NormalAttack, [AuraType.Cryo], 1),
      getCriticalRateBonus(AttackTag.ChargedAttack, [AuraType.Freeze], 1),
      getCriticalRateBonus(AttackTag.NormalAttack, [AuraType.Hydro], 1),
      getCriticalRateBonus(AttackTag.ElementalSkill, [AuraType.Cryo], 1),
      getCriticalRateBonus(AttackTag.NormalAttack, [AuraType.Cryo], 0),
    ]).toStrictEqual([0.15, 0.15, 0, 0, 0]);
  });

  test("constellation 4 shields him for 30% of his Max HP as Cryo, for 20 seconds, when a drain takes him under 20% HP", () => {
    expect.hasAssertions();
    const combatant: Combatant = { ...createKaeyaCombatant(), constellationCount: 4 };
    const context = createKitTestContext(combatant);

    drainKaeya(combatant, context, 0.15);

    expect(getShields(context.kitEffectState)).toStrictEqual([
      {
        characterId: KAEYA_CHARACTER_ID,
        element: Element.Cryo,
        health: 0.3 * combatant.attributes.maxHealth,
        kind: "shield",
        secondsRemaining: 20,
      },
    ]);
  });

  test("constellation 4 leaves a drain that takes him to 20% HP or above unshielded", () => {
    expect.hasAssertions();
    const combatant: Combatant = { ...createKaeyaCombatant(), constellationCount: 4 };
    const context = createKitTestContext(combatant);

    drainKaeya(combatant, context, 0.25);

    expect(getShields(context.kitEffectState)).toStrictEqual([]);
  });

  test("constellation 4 shields once every 60 seconds, so a drain within them is not shielded", () => {
    expect.hasAssertions();
    const combatant: Combatant = { ...createKaeyaCombatant(), constellationCount: 4 };
    const context = createKitTestContext(combatant);
    const shieldCounts: number[] = [];

    drainKaeya(combatant, context, 0.15);
    shieldCounts.push(getShields(context.kitEffectState).length);
    // The first shield has run out by 30 seconds, and the cooldown still holds the second drain back
    stepKitSeconds(context, 30);
    drainKaeya(combatant, context, 0.1);
    shieldCounts.push(getShields(context.kitEffectState).length);
    stepKitSeconds(context, 31);
    drainKaeya(combatant, context, 0.1);
    shieldCounts.push(getShields(context.kitEffectState).length);

    expect(shieldCounts).toStrictEqual([1, 0, 1]);
  });

  test("constellation 3 leaves a drain under 20% HP unshielded", () => {
    expect.hasAssertions();
    const combatant: Combatant = { ...createKaeyaCombatant(), constellationCount: 3 };
    const context = createKitTestContext(combatant);

    drainKaeya(combatant, context, 0.15);

    expect(getShields(context.kitEffectState)).toStrictEqual([]);
  });

  test("constellation 2 extends Glacial Waltz by 2.5 seconds for each enemy defeated during it", () => {
    expect.hasAssertions();
    const combatant: Combatant = { ...createKaeyaCombatant(), constellationCount: 2 };
    const context = createKitTestContext(combatant);
    KAEYA_KIT.elementalBurst.onStart?.(context);
    const startSeconds = takeOne(getSummons(context.kitEffectState)).secondsRemaining;

    defeatEnemy(combatant, context);
    expect(takeOne(getSummons(context.kitEffectState)).secondsRemaining).toBe(startSeconds + 2.5);

    defeatEnemy(combatant, context);
    expect(takeOne(getSummons(context.kitEffectState)).secondsRemaining).toBe(startSeconds + 5);
  });

  test("constellation 2 holds Glacial Waltz to 15 seconds in all, so the defeats after the third add nothing", () => {
    expect.hasAssertions();
    const combatant: Combatant = { ...createKaeyaCombatant(), constellationCount: 2 };
    const context = createKitTestContext(combatant);
    KAEYA_KIT.elementalBurst.onStart?.(context);

    for (let defeat = 0; defeat < 4; defeat++) defeatEnemy(combatant, context);

    expect(takeOne(getSummons(context.kitEffectState)).secondsRemaining).toBeCloseTo(15);
  });

  test("constellation 1 leaves Glacial Waltz's duration as it is when an enemy is defeated", () => {
    expect.hasAssertions();
    const combatant: Combatant = { ...createKaeyaCombatant(), constellationCount: 1 };
    const context = createKitTestContext(combatant);
    KAEYA_KIT.elementalBurst.onStart?.(context);
    const startSeconds = takeOne(getSummons(context.kitEffectState)).secondsRemaining;

    defeatEnemy(combatant, context);

    expect(takeOne(getSummons(context.kitEffectState)).secondsRemaining).toBe(startSeconds);
  });

  test("constellation 2 does not extend Glacial Waltz once it has ended", () => {
    expect.hasAssertions();
    const combatant: Combatant = { ...createKaeyaCombatant(), constellationCount: 2 };
    const context = createKitTestContext(combatant);
    KAEYA_KIT.elementalBurst.onStart?.(context);
    stepKitTestEffects(9, context);

    defeatEnemy(combatant, context);

    expect(getSummons(context.kitEffectState)).toStrictEqual([]);
  });
});
