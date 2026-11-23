import type { KitReaction } from "#src/models/kit/KitReaction";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ReactionType } from "#src/models/combat/ReactionType";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createReactionDamageBonusPassiveModule } from "#src/services/weapon/passives/createReactionDamageBonusPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createReactionDamageBonusPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  const createReaction = (reactionType: ReactionType): KitReaction => ({ combatant: wielder, enemy, reactionType });
  // Swift and Sure at its first rank: 48% Electro-Charged DMG and 12% Lunar-Charged DMG, the Lunar-Charged one 12% more
  // Under Ascendant Gleam, and Token of Covenant reads the same shape over Bloom and Lunar-Bloom
  const passiveModule = createReactionDamageBonusPassiveModule([0.48, 0.12, 0.12], {
    firstReactionType: ReactionType.ElectroCharged,
    secondReactionType: ReactionType.LunarCharged,
  });

  test("the first named reaction's DMG is raised by the rank's first amount", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);

    expect(
      passiveModule.getPartyReactionBonus?.(wielder, createReaction(ReactionType.ElectroCharged), context)?.damageBonus,
    ).toBe(0.48);
  });

  test("the second named reaction's DMG is raised by the rank's second amount", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);

    expect(
      passiveModule.getPartyReactionBonus?.(wielder, createReaction(ReactionType.LunarCharged), context)?.damageBonus,
    ).toBe(0.12);
  });

  test("a reaction outside the two named raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);

    expect(
      passiveModule.getPartyReactionBonus?.(wielder, createReaction(ReactionType.Vaporize), context)?.damageBonus ?? 0,
    ).toBe(0);
  });
});
