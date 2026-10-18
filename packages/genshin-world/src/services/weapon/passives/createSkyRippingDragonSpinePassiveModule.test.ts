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
import { createSkyRippingDragonSpinePassiveModule } from "#src/services/weapon/passives/createSkyRippingDragonSpinePassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: 1000 }]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
// Sky-ripping Dragon Spine at its first rank: a vacuum blade of 80% of ATK for each of eight Normal or Charged Attack hits
// After a burst, for twenty seconds
const skyRippingDragonSpinePassiveModule = createSkyRippingDragonSpinePassiveModule([0.08, 0.8, 20, 8]);
const BURST_USED = { characterId: TRAVELER_CHARACTER_ID, energyCost: 40, kind: KitEventKind.BurstUsed as const };
const createAttackDamageTaken = (attackTag: AttackTag): KitEvent => ({
  attackTag,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken,
  striker: wielder,
});

describe(createSkyRippingDragonSpinePassiveModule, () => {
  test("a normal attack hit after a burst queues a vacuum blade at the rank's multiplier of ATK", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    skyRippingDragonSpinePassiveModule.onKitEvent?.(BURST_USED, context, wielder);
    skyRippingDragonSpinePassiveModule.onKitEvent?.(createAttackDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes.map(({ hit }) => hit.talentMultiplier)).toStrictEqual([0.8]);
  });

  test("a hit before a burst, or an elemental skill's hit after one, queues no blade", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    skyRippingDragonSpinePassiveModule.onKitEvent?.(createAttackDamageTaken(AttackTag.NormalAttack), context, wielder);
    skyRippingDragonSpinePassiveModule.onKitEvent?.(BURST_USED, context, wielder);
    skyRippingDragonSpinePassiveModule.onKitEvent?.(
      createAttackDamageTaken(AttackTag.ElementalSkill),
      context,
      wielder,
    );

    expect(context.strikes).toHaveLength(0);
  });

  test("the blades stop at the rank's count of eight", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    skyRippingDragonSpinePassiveModule.onKitEvent?.(BURST_USED, context, wielder);
    for (let hitIndex = 0; hitIndex < 9; hitIndex++)
      skyRippingDragonSpinePassiveModule.onKitEvent?.(
        createAttackDamageTaken(AttackTag.ChargedAttack),
        context,
        wielder,
      );

    expect(context.strikes).toHaveLength(8);
  });

  test("the blades stop once the rank's twenty seconds run out", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    skyRippingDragonSpinePassiveModule.onKitEvent?.(BURST_USED, context, wielder);
    stepKitSeconds(context, 21);
    skyRippingDragonSpinePassiveModule.onKitEvent?.(createAttackDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toStrictEqual([]);
  });
});
