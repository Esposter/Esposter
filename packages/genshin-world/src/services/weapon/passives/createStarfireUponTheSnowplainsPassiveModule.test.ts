import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createReaction, createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { createStarfireUponTheSnowplainsPassiveModule } from "#src/services/weapon/passives/createStarfireUponTheSnowplainsPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const getBuffs = (effects: readonly KitEffect[]) => effects.filter(({ kind }) => kind === "buff");

describe(createStarfireUponTheSnowplainsPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Synthetic params, not the weapon's row: a quarter ATK for three seconds after a reaction, and half Stellar
  // Glimmer reaction DMG for two seconds after a Stellar Glimmer reaction
  const starfireUponTheSnowplainsPassiveModule = createStarfireUponTheSnowplainsPassiveModule([0.25, 3, 0.5, 2]);

  test("an Elemental Reaction the wielder causes raises its ATK by the rank's percentage for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    starfireUponTheSnowplainsPassiveModule.onKitEvent?.(
      createReaction(wielder, enemy, ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );

    expect(getBuffs(context.kitEffectState.effects)).toStrictEqual([
      {
        amount: 0.25,
        attribute: Attribute.AttackPercent,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 3,
        source: "starfireUponTheSnowplains",
      },
    ]);
  });

  test("a Stellar Glimmer reaction is an Elemental Reaction too, so it raises the ATK and its Stellar Glimmer reaction DMG", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    starfireUponTheSnowplainsPassiveModule.onKitEvent?.(
      createReaction(wielder, enemy, ReactionType.StellarSwirl, Element.Anemo),
      context,
      wielder,
    );

    expect(getBuffs(context.kitEffectState.effects)).toStrictEqual([
      {
        amount: 0.25,
        attribute: Attribute.AttackPercent,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 3,
        source: "starfireUponTheSnowplains",
      },
      {
        amount: 0.5,
        attribute: Attribute.StellarGlimmerReactionDamageBonus,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 2,
        source: "starfireUponTheSnowplains",
      },
    ]);
  });
});
