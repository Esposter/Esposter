import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import {
  createReaction,
  createWielderCombatant,
  getBuff,
} from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { createReactionAttackPassiveModule } from "#src/services/weapon/passives/createReactionAttackPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
describe(createReactionAttackPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // A passive naming Overloaded and a Pyro Swirl, at a synthetic half ATK percentage, not the weapon's row
  const reactionAttackPassiveModule = createReactionAttackPassiveModule(
    [{ reactionType: ReactionType.Overloaded }, { element: Element.Pyro, reactionType: ReactionType.Swirl }],
    [0.5],
  );

  test("a reaction the wielder triggers from the ones it names raises ATK by the rank's percentage", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    reactionAttackPassiveModule.onKitEvent?.(
      createReaction(wielder, enemy, ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );

    expect(getBuff(kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.5);
  });

  test("a Swirl of an element the passive does not name raises nothing", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    reactionAttackPassiveModule.onKitEvent?.(
      createReaction(wielder, enemy, ReactionType.Swirl, Element.Hydro),
      context,
      wielder,
    );

    expect(getBuff(kitEffectState, Attribute.AttackPercent)).toBeUndefined();
  });
});
