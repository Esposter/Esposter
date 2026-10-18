import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitStance } from "#src/models/kit/KitStance";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { KUKI_CHARACTER_ID } from "#src/services/kit/characters/kukiKit";
import { createNilouKitBehaviour, NILOU_CHARACTER_ID } from "#src/services/kit/characters/nilouKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const NILOU_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NILOU_CHARACTER_ID);
const findStance = (kitEffectState: KitEffectState): KitStance | undefined =>
  kitEffectState.effects.find((effect): effect is KitStance => effect.kind === "stance");
const findField = (kitEffectState: KitEffectState): KitField | undefined =>
  kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");

describe(createNilouKitBehaviour, () => {
  // The passive bonuses a constellation count gives, each as its attribute and its amount rounded to a thousandth
  const getPassiveBonusPairs = (constellationCount: number): [Attribute, number][] =>
    (NILOU_KIT.getPassiveBonuses?.(createNilouCombatant(constellationCount), 1, [], []) ?? []).map(
      ({ amount, attribute }) => [attribute, Math.round(amount * 1000) / 1000],
    );

  // The effects an action's start adds to the team's, which its owner holds
  const castAction = (action: KitAction, combatant = createNilouCombatant()): KitEffectState => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    return kitEffectState;
  };

  const createNilouCombatant = (constellationCount = 0): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
    characterId: NILOU_CHARACTER_ID,
    constellationCount,
    elementalResonances: [],
    kit: NILOU_KIT,
    level: 90,
    weaponType: WeaponType.Sword,
  });

  const MAX_HEALTH = 10_000;
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };

  test("reads the strikes', charged attack's, plunges' multipliers from her proud skill group", () => {
    expect.hasAssertions();
    const multipliers = [
      ...NILOU_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...NILOU_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      NILOU_KIT.plungeCollision.talentMultiplier,
      takeOne(NILOU_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(NILOU_KIT.highPlunge.hits).talentMultiplier,
    ];

    expect(multipliers).toStrictEqual([0.503074, 0.45439, 0.70354, 0.50224, 0.54438, 0.639324, 1.278377, 1.596762]);
  });

  test("the charged attack costs 20 stamina, her skill cools for 18 seconds, and her burst costs 70 energy and cools for 18", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: NILOU_KIT.burstCooldownSeconds,
      burstEnergyCost: NILOU_KIT.burstEnergyCost,
      chargedAttackStamina: NILOU_KIT.chargedAttackStamina,
      skillCooldownSeconds: NILOU_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 18,
      burstEnergyCost: 70,
      chargedAttackStamina: 20,
      skillCooldownSeconds: 18,
    });
  });

  test("dance of Haftkarsvar's hit is priced at its share of Max HP, not ATK, at 16 frames", () => {
    expect.hasAssertions();
    const hit = takeOne(NILOU_KIT.elementalSkill.hits);

    expect({
      flatDamage: Math.round((hit.additiveBaseDamageBonus?.(createNilouCombatant()) ?? 0) * 100) / 100,
      hitmarkFrames: Math.round(hit.hitmarkSeconds * 60),
      multiplier: hit.talentMultiplier,
    }).toStrictEqual({ flatDamage: 333.89, hitmarkFrames: 16, multiplier: 0 });
  });

  test("dance of Abzendegi's hit is priced at its share of Max HP, at 91 frames", () => {
    expect.hasAssertions();
    const hit = takeOne(NILOU_KIT.elementalBurst.hits);

    expect({
      flatDamage: Math.round((hit.additiveBaseDamageBonus?.(createNilouCombatant()) ?? 0) * 100) / 100,
      hitmarkFrames: Math.round(hit.hitmarkSeconds * 60),
    }).toStrictEqual({ flatDamage: 1843.2, hitmarkFrames: 91 });
  });

  test("dance of Haftkarsvar leaves Pirouette on the team for ten seconds, with the sword dance as its normal attacks", () => {
    expect.hasAssertions();
    const stance = findStance(castAction(NILOU_KIT.elementalSkill));

    expect({
      normalAttacks: stance?.combatant.kit.normalAttacks.length,
      secondsRemaining: stance?.secondsRemaining,
      skillHitmarkFrames: Math.round(takeOne(stance?.combatant.kit.elementalSkill.hits ?? []).hitmarkSeconds * 60),
    }).toStrictEqual({ normalAttacks: 3, secondsRemaining: 10, skillHitmarkFrames: 21 });
  });

  test("the third sword dance sets Lunar Prayer on the team 30 frames on, for eight seconds", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant();
    const kitEffectState = castAction(NILOU_KIT.elementalSkill, combatant);
    const context = createKitTestContext(combatant, { kitEffectState });
    const thirdStep = takeOne((findStance(kitEffectState)?.combatant.kit.normalAttacks ?? []).slice(2));
    thirdStep.onStart?.(context);
    const endField = findField(kitEffectState);
    endField?.onTick(context, 0);

    expect({
      lunarPrayerNormalAttacks: findStance(kitEffectState)?.combatant.kit.normalAttacks.length,
      lunarPrayerSeconds: findStance(kitEffectState)?.secondsRemaining,
      nextTickFrames: Math.round((endField?.nextTickSeconds ?? 0) * 60),
    }).toStrictEqual({ lunarPrayerNormalAttacks: 3, lunarPrayerSeconds: 8, nextTickFrames: 30 });
  });

  test("constellation 1 raises Luminous Illusion's DMG by 65%, and no other strike's", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant(1);
    const sword = findStance(castAction(NILOU_KIT.elementalSkill, combatant))?.combatant.kit.normalAttacks ?? [];
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const party = createParty([NILOU_CHARACTER_ID]);
    const getBonus = (action: KitAction, constellationCount: number): number | undefined =>
      NILOU_KIT.getStrikeDamageBonus?.(
        {
          attackTag: AttackTag.ElementalSkill,
          body: kitBody,
          combatant: createNilouCombatant(constellationCount),
          hit: takeOne(action.hits),
        },
        enemy,
        party,
      );
    const illusion = takeOne(sword.slice(2));

    expect({
      firstStrike: getBonus(takeOne(sword.slice(0, 1)), 1),
      illusion: getBonus(illusion, 1),
      illusionAtConstellation0: getBonus(illusion, 0),
    }).toStrictEqual({ firstStrike: 0, illusion: 0.65, illusionAtConstellation0: 0 });
  });

  test("constellation 6 gives CRIT Rate and CRIT DMG for each 1,000 Max HP, capped at 30% and 60%", () => {
    expect.hasAssertions();
    expect({ constellation5: getPassiveBonusPairs(5), constellation6: getPassiveBonusPairs(6) }).toStrictEqual({
      constellation5: [],
      constellation6: [
        [Attribute.CriticalRate, 0.06],
        [Attribute.CriticalDamage, 0.12],
      ],
    });
  });

  test("leaving the field cancels the field that would hand the team Lunar Prayer", () => {
    expect.hasAssertions();
    const combatant = createNilouCombatant();
    const kitEffectState = castAction(NILOU_KIT.elementalSkill, combatant);
    const context = createKitTestContext(combatant, { kitEffectState });
    takeOne((findStance(kitEffectState)?.combatant.kit.normalAttacks ?? []).slice(2)).onStart?.(context);
    NILOU_KIT.onKitEvent?.(
      { characterId: KUKI_CHARACTER_ID, kind: KitEventKind.CharacterSwapped, previousCharacterId: NILOU_CHARACTER_ID },
      context,
      combatant,
    );

    expect(findField(kitEffectState)?.secondsRemaining).toBe(0);
  });
});
