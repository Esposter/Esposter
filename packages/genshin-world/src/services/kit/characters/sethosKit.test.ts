import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createSethosKitBehaviour, SETHOS_CHARACTER_ID } from "#src/services/kit/characters/sethosKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const SETHOS_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, SETHOS_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createSethosCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: SETHOS_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: SETHOS_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

// The CRIT Rate bonus Sethos's kit gives a strike of the attack tag, as a Sethos at the constellation count strikes
const readCriticalRateBonus = (constellationCount: number, attackTag: AttackTag): number => {
  const combatant = createSethosCombatant(constellationCount);
  const context = createKitTestContext(combatant);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const strike = { attackTag, body: context.body, combatant, hit: takeOne(SETHOS_KIT.chargedAttack.hits) };
  return SETHOS_KIT.getStrikeCriticalRateBonus?.(strike, enemy, context.party, context.kitEffectState.effects) ?? 0;
};

describe(createSethosKitBehaviour, () => {
  test("reads the skill's cooldown, the burst's cooldown and cost, and the strikes' multipliers from his proud skill groups", () => {
    expect.hasAssertions();

    expect({
      burstCooldownSeconds: SETHOS_KIT.burstCooldownSeconds,
      burstEnergyCost: SETHOS_KIT.burstEnergyCost,
      multipliers: SETHOS_KIT.normalAttacks.map(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      skillCooldownSeconds: SETHOS_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      multipliers: [
        [expect.closeTo(0.5261, 3)],
        [expect.closeTo(0.238, 3), expect.closeTo(0.2661, 3)],
        [expect.closeTo(0.7399, 3)],
      ],
      skillCooldownSeconds: 8,
    });
  });

  test("the fully-charged Aimed Shot is his aimed, Electro charged attack at 74 frames, spending no stamina", () => {
    expect.hasAssertions();

    expect({
      gauge: SETHOS_KIT.chargedAttack.hits[0]?.gauge,
      hitmarkSeconds: SETHOS_KIT.chargedAttack.hits[0]?.hitmarkSeconds,
      isAimed: SETHOS_KIT.chargedAttack.isAimed,
      stamina: SETHOS_KIT.chargedAttackStamina,
    }).toStrictEqual({ gauge: 1, hitmarkSeconds: 74 / 60, isAimed: true, stamina: 0 });
  });

  test("constellation 1 raises the CRIT Rate of the fully-charged Aimed Shot by 15%, and gives his normal attacks none", () => {
    expect.hasAssertions();

    expect([
      readCriticalRateBonus(0, AttackTag.ChargedAttack),
      readCriticalRateBonus(1, AttackTag.ChargedAttack),
      readCriticalRateBonus(1, AttackTag.NormalAttack),
    ]).toStrictEqual([0, 0.15, 0]);
  });
});
