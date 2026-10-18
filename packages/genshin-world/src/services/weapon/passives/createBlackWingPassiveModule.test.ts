import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createBlackWingPassiveModule } from "#src/services/weapon/passives/createBlackWingPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Skyward Spine at its first rank: eight per cent CRIT Rate, twelve per cent Normal Attack SPD, a half chance, forty per cent ATK
const blackWingPassiveModule = createBlackWingPassiveModule([0.08, 0.12, 0.5, 0.4]);
const createDamageTaken = (attackTag: AttackTag): KitEvent => ({
  attackTag,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken,
  striker: wielder,
});

describe(createBlackWingPassiveModule, () => {
  test("the rank's CRIT Rate and Normal Attack SPD are passive bonuses on the wielder", () => {
    expect.hasAssertions();

    expect(blackWingPassiveModule.getPassiveBonuses?.(wielder, 1, [])).toStrictEqual([
      { amount: 0.08, attribute: Attribute.CriticalRate },
      { amount: 0.12, attribute: Attribute.NormalAttackSpeed },
    ]);
  });

  test("a normal attack that rolls under the chance queues a vacuum blade at the rank's multiplier", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    blackWingPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(1);
    expect(context.strikes[0]?.hit.talentMultiplier).toBe(0.4);
  });

  test("a normal attack that rolls at or above the chance queues nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { random: () => 0.9 });
    blackWingPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });

  test("an elemental skill queues nothing, as it is neither a normal nor a charged attack", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    blackWingPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });

  test("a second blade inside the two-second cooldown queues nothing, and one after it does", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    blackWingPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);
    blackWingPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(1);

    stepKitSeconds(context, 2.5);
    blackWingPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    // The step consumes the blade queued before it, so the one queued after the cooldown is the only one left
    expect(context.strikes).toHaveLength(1);
  });
});
