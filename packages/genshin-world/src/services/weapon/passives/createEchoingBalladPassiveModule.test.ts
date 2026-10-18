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
import { createEchoingBalladPassiveModule } from "#src/services/weapon/passives/createEchoingBalladPassiveModule";
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
// Skyward Harp at its first rank: twenty per cent CRIT DMG, a sixty per cent chance, 125% ATK, and a four-second cooldown
const echoingBalladPassiveModule = createEchoingBalladPassiveModule([0.2, 0.6, 1.25, 4]);
const createDamageTaken = (attackTag?: AttackTag): KitEvent => ({
  ...(attackTag === undefined ? {} : { attackTag }),
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken,
  striker: wielder,
});

describe(createEchoingBalladPassiveModule, () => {
  test("the rank's CRIT DMG is a passive bonus on the wielder", () => {
    expect.hasAssertions();

    expect(echoingBalladPassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 0.2, attribute: Attribute.CriticalDamage },
    ]);
  });

  test("a hit of the wielder's own attack that rolls under the chance queues a physical AoE at the rank's multiplier", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    echoingBalladPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(1);
    expect(context.strikes[0]?.hit.talentMultiplier).toBe(1.25);
    expect(context.strikes[0]?.hit.element).toBeUndefined();
  });

  test("a hit with no attack tag, a passive's own queued hit, queues nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    echoingBalladPassiveModule.onKitEvent?.(createDamageTaken(), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });

  test("a hit that rolls at or above the chance queues nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { random: () => 0.9 });
    echoingBalladPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });

  test("a second AoE inside the four-second cooldown queues nothing, and one after it does", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    echoingBalladPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);
    echoingBalladPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(1);

    stepKitSeconds(context, 4.5);
    echoingBalladPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    // The step consumes the AoE queued before it, so the one queued after the cooldown is the only one left
    expect(context.strikes).toHaveLength(1);
  });
});
