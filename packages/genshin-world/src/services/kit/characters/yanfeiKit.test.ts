import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createYanfeiKitBehaviour, YANFEI_CHARACTER_ID } from "#src/services/kit/characters/yanfeiKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const YANFEI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, YANFEI_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createYanfeiCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: YANFEI_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: YANFEI_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

// The seal statuses of the effects held, as the kit counts them
const countSealStatuses = (effects: KitEffect[]): number =>
  effects.filter((effect) => effect.kind === "status" && effect.id.startsWith("yanfei-seal")).length;

const getCriticalRateBonus = (constellationCount: number, healthShare: number): number => {
  const combatant = createYanfeiCombatant(constellationCount);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  return (
    YANFEI_KIT.getStrikeCriticalRateBonus?.(
      {
        attackTag: AttackTag.ChargedAttack,
        body: createKitTestContext(combatant).body,
        combatant,
        hit: takeOne(YANFEI_KIT.chargedAttack.hits),
      },
      { ...enemy, health: healthShare * enemy.maxHealth },
    ) ?? 0
  );
};

describe(createYanfeiKitBehaviour, () => {
  test("the charged attack spends the Scarlet Seals it starts with, and their count sets its radius", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = {
      effects: [
        { characterId: YANFEI_CHARACTER_ID, id: "yanfei-seal-0", kind: "status", secondsRemaining: 10 },
        { characterId: YANFEI_CHARACTER_ID, id: "yanfei-seal-1", kind: "status", secondsRemaining: 10 },
      ],
    };

    YANFEI_KIT.chargedAttack.onStart?.(createKitTestContext(createYanfeiCombatant(), { kitEffectState }));

    expect(countSealStatuses(kitEffectState.effects)).toBe(0);
    const [summon] = kitEffectState.effects;
    if (summon?.kind !== "summon") throw new Error("the charged attack casts no summon");
    // Two seals give the charge's 3.5 metres, which the targeting area's 5 metres are added to
    expect(summon.hits[0]?.hitArea.radius).toBeCloseTo(8.5);
  });

  test("constellation 6 holds a fourth Scarlet Seal, where three is the most before it", () => {
    expect.hasAssertions();
    const hit = YANFEI_KIT.elementalSkill.hits[0];
    if (!hit?.onStrike) throw new Error("Signed Edict has no seal on hit");
    const combatant = createYanfeiCombatant(6);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });

    hit.onStrike(context, { body: context.body, combatant, hit });

    expect(countSealStatuses(kitEffectState.effects)).toBe(4);
  });

  test("a Constellation 2 switch adds 20% CRIT Rate to her Charged Attacks on an enemy below half HP", () => {
    expect.hasAssertions();

    expect(getCriticalRateBonus(2, 0.4)).toBe(0.2);
  });

  test("a Constellation 1 switch, or an enemy at half HP, adds no CRIT Rate to her Charged Attacks", () => {
    expect.hasAssertions();

    expect([getCriticalRateBonus(1, 0.4), getCriticalRateBonus(2, 0.5)]).toStrictEqual([0, 0]);
  });
});
