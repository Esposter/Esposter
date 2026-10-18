import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { CHARLOTTE_CHARACTER_ID, createCharlotteKitBehaviour } from "#src/services/kit/characters/charlotteKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const CHARLOTTE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CHARLOTTE_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createCharlotteKitBehaviour, () => {
  const createCharlotteCombatant = (): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([
      { attribute: Attribute.BaseHealth, value: MAX_HEALTH },
      { attribute: Attribute.BaseAttack, value: ATTACK },
    ]),
    characterId: CHARLOTTE_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: CHARLOTTE_KIT,
    level: 90,
    weaponType: WeaponType.Catalyst,
  });

  const MAX_HEALTH = 10_000;
  const ATTACK = 1000;
  const THORN_HITMARK_SECONDS = 97 / 60;

  test("the charged attack's Spiritbreath Thorn strikes once, and a thorn within its six-second cooldown is not opened", () => {
    expect.hasAssertions();
    const target = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const context = createKitTestContext(createCharlotteCombatant());
    const castCharged = (): void => CHARLOTTE_KIT.chargedAttack.onStart?.(context, target);
    const stepThorn = (stepSeconds: number): number => stepKitTestEffects(stepSeconds, context).length;

    castCharged();
    const firstThorn = stepThorn(THORN_HITMARK_SECONDS);
    castCharged();
    const thornInCooldown = stepThorn(THORN_HITMARK_SECONDS);
    stepThorn(6);
    castCharged();
    const thornAfterCooldown = stepThorn(THORN_HITMARK_SECONDS);

    expect([firstThorn, thornInCooldown, thornAfterCooldown]).toStrictEqual([1, 0, 1]);
  });

  test("framing's press marks the first five enemies it strikes and no more", () => {
    expect.hasAssertions();
    const combatant = createCharlotteCombatant();
    const press = CHARLOTTE_KIT.elementalSkill.hits[0]?.enemyStatus;
    CHARLOTTE_KIT.elementalSkill.onStart?.(createKitTestContext(combatant));
    const marks = Array.from({ length: 6 }, () => press?.(combatant) !== undefined);

    expect(marks).toStrictEqual([true, true, true, true, true, false]);
  });

  test("still photo's cast heals every member of the party at its strike's frame, by its flat HP and a share of the caster's ATK", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createCharlotteCombatant());
    const member = context.party.characterIdMemberMap.get(CHARLOTTE_CHARACTER_ID);
    if (!member) throw new Error("Charlotte is not in her party");
    member.healthShare = 0.5;
    CHARLOTTE_KIT.elementalBurst.onStart?.(context);
    const stepBurst = (stepSeconds: number): void => {
      stepKitEffects(stepSeconds, context);
    };

    stepBurst(52 / 60);
    const beforeStrike = member.healthShare;
    stepBurst(2 / 60);

    expect(beforeStrike).toBe(0.5);
    expect(member.healthShare).toBeCloseTo(0.5 + (1608.4863 + 2.565734 * ATTACK) / MAX_HEALTH);
  });

  test("the Ascension 4 Healing Bonus and Cryo DMG Bonus count each other member by region, at 5% apiece", () => {
    expect.hasAssertions();
    const charlotte = { ...createCharlotteCombatant(), ascension: 4 };
    const team = [
      charlotte,
      { ...charlotte, characterId: 2, regionId: "fontaine" },
      { ...charlotte, characterId: 3, regionId: "mondstadt" },
      { ...charlotte, characterId: 4 },
    ];
    expect(CHARLOTTE_KIT.getPassiveBonuses?.(charlotte, 1, [], team)).toStrictEqual([
      { amount: 0.05, attribute: Attribute.HealingBonus },
      { amount: 0.1, attribute: Attribute.CryoDamageBonus },
    ]);
    expect(CHARLOTTE_KIT.getPassiveBonuses?.(createCharlotteCombatant(), 1, [], team)).toStrictEqual([]);
  });
});
