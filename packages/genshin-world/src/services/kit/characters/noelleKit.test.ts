import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { NOELLE_CHARACTER_ID } from "#src/services/kit/characters/noelleKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { healKitParty } from "#src/services/kit/effects/healKitParty";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const NOELLE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NOELLE_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe("noelle kit", () => {
  const DEFENSE = 800;
  const createNoelleCombatant = (): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([
      { attribute: Attribute.BaseHealth, value: 10_000 },
      { attribute: Attribute.BaseDefense, value: DEFENSE },
    ]),
    characterId: NOELLE_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: NOELLE_KIT,
    level: 90,
  });

  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...NOELLE_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...NOELLE_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      NOELLE_KIT.plungeCollision.talentMultiplier,
      takeOne(NOELLE_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(NOELLE_KIT.highPlunge.hits).talentMultiplier,
      takeOne(NOELLE_KIT.elementalSkill.hits).talentMultiplier,
      ...NOELLE_KIT.elementalBurst.hits.map(({ talentMultiplier }) => talentMultiplier),
    ];
    const expectedMultipliers = [
      0.7912, 0.7336, 0.8626, 1.1343, 0.5074, 0.9047, 0.7459, 1.4914, 1.8629, 1.2, 0.672, 0.928,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("its Breastplate shields her for 160% of her DEF plus 769 for 12 seconds", () => {
    expect.hasAssertions();
    const combatant = createNoelleCombatant();
    const context = createKitTestContext(combatant);
    NOELLE_KIT.elementalSkill.onStart?.(context);
    expect(context.kitEffectState.effects).toStrictEqual([
      {
        characterId: NOELLE_CHARACTER_ID,
        element: Element.Geo,
        health: 1.6 * combatant.attributes.defense + 769.7851,
        kind: "shield",
        secondsRemaining: 12,
      },
    ]);
  });

  test("its Sweeping Time converts her attacks to Geo and adds 40% of her DEF to her ATK", () => {
    expect.hasAssertions();
    const combatant = createNoelleCombatant();
    const context = createKitTestContext(combatant);
    NOELLE_KIT.elementalBurst.onStart?.(context);
    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 0.4 * combatant.attributes.defense,
        attribute: Attribute.Attack,
        characterId: NOELLE_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 15 + 80 / 60,
      },
      {
        characterId: NOELLE_CHARACTER_ID,
        element: Element.Geo,
        isConverted: true,
        kind: "infusion",
        secondsRemaining: 15 + 80 / 60,
      },
    ]);
  });

  test("with I Got Your Back, Breastplate's heal is certain under Sweeping Time from one constellation, and at its chance otherwise", () => {
    expect.hasAssertions();
    const combatant = { ...createNoelleCombatant(), constellationCount: 1 };
    const sweepingTime: KitEffect = {
      characterId: combatant.characterId,
      element: Element.Geo,
      isConverted: true,
      kind: "infusion",
      secondsRemaining: 10,
    };
    const { healParty } = takeOne(NOELLE_KIT.elementalSkill.hits);

    expect(healParty?.chance(combatant, [sweepingTime])).toBe(1);
    expect(healParty?.chance(combatant, [])).toBeCloseTo(0.5, 5);
    expect(healParty?.chance({ ...combatant, constellationCount: 0 }, [sweepingTime])).toBeCloseTo(0.5, 5);
  });

  test("its Breastplate heal reaches the party through healKitParty, 21.28% of her DEF plus 102.7 HP as a share of each member's Max HP", () => {
    expect.hasAssertions();
    const combatant = createNoelleCombatant();
    const context = createKitTestContext(combatant);
    const partyMember = getPartyMember(context.party, NOELLE_CHARACTER_ID);
    partyMember.healthShare = 0.5;
    const hit = takeOne(NOELLE_KIT.elementalSkill.hits);
    NOELLE_KIT.elementalSkill.onStart?.(context);

    expect(healKitParty({ ...context, random: () => 0.6 }, combatant, combatant, hit)).toBe(false);
    expect(healKitParty({ ...context, random: () => 0.4 }, combatant, combatant, hit)).toBe(true);
    expect(partyMember.healthShare).toBeCloseTo(
      0.5 + (0.2128 * combatant.attributes.defense + 102.71802) / combatant.attributes.maxHealth,
      5,
    );
  });

  test("with To Be Cleaned, her shield explodes as it ends for 4 times her ATK of Geo, on the character on the field, from four constellations", () => {
    expect.hasAssertions();
    const party = createParty([NOELLE_CHARACTER_ID]);
    const explodeAfterShield = (constellationCount: number) => {
      const context = createKitTestContext(
        { ...createNoelleCombatant(), constellationCount },
        { body: { facing: 0, height: 0, position: { x: 10, z: 0 } }, party },
      );
      NOELLE_KIT.elementalSkill.onStart?.(context);
      // Breastplate lasts 12 seconds, so 13 seconds run it out
      return stepKitTestEffects(13, { ...context, body: { facing: 0, height: 0, position: { x: -4, z: 7 } } });
    };

    expect(explodeAfterShield(3)).toStrictEqual([]);
    const [explosion] = explodeAfterShield(4);
    expect(explosion?.hit.talentMultiplier).toBe(4);
    expect(explosion?.hit.element).toBe(Element.Geo);
    expect(explosion?.body.position).toStrictEqual({ x: -4, z: 7 });
  });

  test("recasting Breastplate ends the shield she holds, whose explosion goes off on the next step", () => {
    expect.hasAssertions();
    const context = createKitTestContext({ ...createNoelleCombatant(), constellationCount: 4 });
    NOELLE_KIT.elementalSkill.onStart?.(context);
    NOELLE_KIT.elementalSkill.onStart?.(context);

    expect(stepKitTestEffects(0.1, context)).toHaveLength(1);
    expect(context.kitEffectState.effects).toHaveLength(1);
  });
  const getChargedAttackDamageBonus = (constellationCount: number): number | undefined => {
    const combatant = { ...createNoelleCombatant(), constellationCount };
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    return NOELLE_KIT.getStrikeDamageBonus?.(
      {
        attackTag: AttackTag.ChargedAttack,
        body: createKitTestContext(combatant).body,
        combatant,
        hit: takeOne(NOELLE_KIT.chargedAttack.hits),
      },
      enemy,
      createParty([NOELLE_CHARACTER_ID]),
    );
  };

  test("a Constellation 2 switch cuts her Charged Attacks' stamina and adds to their DMG", () => {
    expect.hasAssertions();
    const context = createKitTestContext({ ...createNoelleCombatant(), constellationCount: 2 });

    expect(NOELLE_KIT.getChargedAttackStaminaMultiplier?.(context)).toBe(0.8);
    expect(getChargedAttackDamageBonus(2)).toBe(0.15);
  });

  test("a Constellation 1 switch changes neither her Charged Attacks' stamina nor their DMG", () => {
    expect.hasAssertions();
    const context = createKitTestContext({ ...createNoelleCombatant(), constellationCount: 1 });

    expect(NOELLE_KIT.getChargedAttackStaminaMultiplier?.(context)).toBe(1);
    expect(getChargedAttackDamageBonus(1)).toBe(0);
  });
});
