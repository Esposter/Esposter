import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createRepentanceAndRedemptionPassiveModule } from "#src/services/weapon/passives/createRepentanceAndRedemptionPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const getBuffs = (effects: readonly KitEffect[]) =>
  effects.filter((effect): effect is KitBuff => effect.kind === "buff");

describe(createRepentanceAndRedemptionPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Synthetic params, not the weapon's row: five Elemental Mastery for two seconds on an Elemental Reaction, and a
  // Fifth ATK for three seconds on a Stellar Glimmer reaction
  const repentanceAndRedemptionPassiveModule = createRepentanceAndRedemptionPassiveModule([5, 2, 0.2, 3]);
  const createReaction = (reactionType: ReactionType, element: Element) => ({
    enemy,
    kind: KitEventKind.ReactionTriggered as const,
    reactions: [{ element, reactionType }],
    striker: wielder,
  });

  test("an Elemental Reaction the wielder triggers raises its Elemental Mastery by the rank's amount for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    repentanceAndRedemptionPassiveModule.onKitEvent?.(
      createReaction(ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );

    expect(getBuffs(context.kitEffectState.effects)).toContainEqual({
      amount: 5,
      attribute: Attribute.ElementalMastery,
      characterId: TRAVELER_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 2,
      source: "repentanceAndRedemption",
    });
  });

  test("a Stellar Glimmer reaction the wielder triggers raises its ATK by the rank's percentage for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    repentanceAndRedemptionPassiveModule.onKitEvent?.(
      createReaction(ReactionType.StellarSwirl, Element.Anemo),
      context,
      wielder,
    );

    expect(getBuffs(context.kitEffectState.effects)).toContainEqual({
      amount: 0.2,
      attribute: Attribute.AttackPercent,
      characterId: TRAVELER_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 3,
      source: "repentanceAndRedemption",
    });
  });

  test("an Elemental Reaction that is not a Stellar Glimmer one raises no ATK", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    repentanceAndRedemptionPassiveModule.onKitEvent?.(
      createReaction(ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );

    expect(getBuffs(context.kitEffectState.effects).map(({ attribute }) => attribute)).not.toContain(
      Attribute.AttackPercent,
    );
  });
});
