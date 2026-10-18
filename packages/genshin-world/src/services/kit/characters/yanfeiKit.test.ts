import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
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
import { createYanfeiKitBehaviour, YANFEI_CHARACTER_ID } from "#src/services/kit/characters/yanfeiKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const YANFEI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, YANFEI_CHARACTER_ID);
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

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
// The hits of the summons a charged attack of Yanfei's at the ascension casts once its hit lands the CRIT hits given on an
// Enemy, the charged attack's own first, as [element, talent multiplier, attack tag, radius]
const landCriticalChargedAttack = (ascension: number, criticalHitCount = 1) => {
  const combatant: Combatant = { ...createYanfeiCombatant(), ascension };
  const context = createKitTestContext(combatant);
  YANFEI_KIT.chargedAttack.onStart?.(context);
  const readSummonHits = () =>
    context.kitEffectState.effects
      .filter((effect): effect is KitSummon => effect.kind === "summon")
      .flatMap(({ hits }) => hits);
  const hit = takeOne(readSummonHits());
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  for (let index = 0; index < criticalHitCount; index++)
    YANFEI_KIT.onKitEvent?.(
      { enemy, hit, isCritical: true, isDefeated: false, kind: KitEventKind.DamageTaken, striker: combatant },
      context,
      combatant,
    );
  return readSummonHits().map(({ attackTag, element, hitArea, talentMultiplier }) => [
    element,
    talentMultiplier,
    attackTag,
    hitArea.radius,
  ]);
};

// The seal statuses of the effects held, as the kit counts them
const countSealStatuses = (effects: KitEffect[]): number =>
  effects.filter((effect) => effect.kind === "status" && effect.id.startsWith("yanfei-seal")).length;

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
});

describe("blazing Eye", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(landCriticalChargedAttack(4).slice(1)).toStrictEqual([[Element.Pyro, 0.8, AttackTag.ChargedAttack, 3.5]]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(landCriticalChargedAttack(3)).toHaveLength(1);
  });

  test("a charged attack sets off one Blazing Eye however many of its strikes are CRIT hits", () => {
    expect.hasAssertions();

    expect(landCriticalChargedAttack(4, 2)).toHaveLength(2);
  });
});
