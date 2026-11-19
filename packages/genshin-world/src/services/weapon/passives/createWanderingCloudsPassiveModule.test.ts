import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { createWanderingCloudsPassiveModule } from "#src/services/weapon/passives/createWanderingCloudsPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createWanderingCloudsPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Synthetic params, not the weapon's row: a fifth Elemental DMG Bonus, a quarter chance, 200% ATK, and a two-second
  // Cooldown
  const wanderingCloudsPassiveModule = createWanderingCloudsPassiveModule([0.2, 0.25, 2, 2]);
  const createDamageTaken = (attackTag: AttackTag): KitEvent => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken,
    striker: wielder,
  });

  test("the rank's Elemental DMG Bonus is a passive bonus on every element", () => {
    expect.hasAssertions();

    expect(wanderingCloudsPassiveModule.getPassiveBonuses?.(wielder, 1, [], [])).toStrictEqual([
      { amount: 0.2, attribute: Attribute.AnemoDamageBonus },
      { amount: 0.2, attribute: Attribute.CryoDamageBonus },
      { amount: 0.2, attribute: Attribute.DendroDamageBonus },
      { amount: 0.2, attribute: Attribute.ElectroDamageBonus },
      { amount: 0.2, attribute: Attribute.GeoDamageBonus },
      { amount: 0.2, attribute: Attribute.HydroDamageBonus },
      { amount: 0.2, attribute: Attribute.PyroDamageBonus },
    ]);
  });

  test("a Normal Attack hit that rolls under the chance queues a physical AoE at the rank's multiplier", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    wanderingCloudsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toStrictEqual([
      {
        body: context.body,
        combatant: wielder,
        hit: { hitArea: SMALL_AOE_AREA, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: 2 },
      },
    ]);
  });

  test("a Charged Attack hit queues nothing, as the rank's chance is on Normal Attack hits", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    wanderingCloudsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ChargedAttack), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });

  test("a Normal Attack hit that rolls at the chance queues nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder, { random: () => 0.25 });
    wanderingCloudsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(0);
  });

  test("a second cloud inside the two-second cooldown queues nothing, and one after it does", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    wanderingCloudsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);
    wanderingCloudsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(1);

    stepKitSeconds(context, 2.5);
    wanderingCloudsPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(context.strikes).toHaveLength(1);
  });
});
