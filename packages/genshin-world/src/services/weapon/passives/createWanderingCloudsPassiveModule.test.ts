import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { createWanderingCloudsPassiveModule } from "#src/services/weapon/passives/createWanderingCloudsPassiveModule";
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
// Skyward Atlas at its first rank: twelve per cent Elemental DMG Bonus, a fifty per cent chance, 160% ATK, and a thirty-second cooldown
const wanderingCloudsPassiveModule = createWanderingCloudsPassiveModule([0.12, 0.5, 1.6, 30]);
const createDamageTaken = (attackTag: AttackTag): KitEvent => ({
  attackTag,
  enemy,
  hit: TRAVELER_KIT.plungeCollision,
  isCritical: false,
  isDefeated: false,
  kind: KitEventKind.DamageTaken,
  striker: wielder,
});

describe(createWanderingCloudsPassiveModule, () => {
  test("the rank's Elemental DMG Bonus is a passive bonus on every element", () => {
    expect.hasAssertions();

    expect(wanderingCloudsPassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual(
      ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: 0.12, attribute })),
    );
  });

  test("a Normal Attack hit that rolls under the chance queues a physical AoE at the rank's multiplier", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    wanderingCloudsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(1);
    expect(context.strikes[0]?.hit.talentMultiplier).toBe(1.6);
    expect(context.strikes[0]?.hit.element).toBeUndefined();
  });

  test("a Charged Attack hit queues nothing, as the rank's chance is on Normal Attack hits", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    wanderingCloudsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });

  test("a Normal Attack hit that rolls at the chance queues nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { random: () => 0.5 });
    wanderingCloudsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });

  test("a second cloud inside the thirty-second cooldown queues nothing, and one after it does", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    wanderingCloudsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);
    wanderingCloudsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(1);

    stepKitSeconds(context, 30.5);
    wanderingCloudsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(1);
  });
});
