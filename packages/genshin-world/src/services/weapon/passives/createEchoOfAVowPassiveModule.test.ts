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
import { createEchoOfAVowPassiveModule } from "#src/services/weapon/passives/createEchoOfAVowPassiveModule";
import { createReaction, createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const getBuffs = (effects: readonly KitEffect[]) => effects.filter(({ kind }) => kind === "buff");

describe(createEchoOfAVowPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Echo of a Vow with synthetic params: 50 Elemental Mastery for three seconds after a reaction, and 10% Stellar
  // Glimmer reaction DMG for two seconds after a Stellar Glimmer reaction
  const echoOfAVowPassiveModule = createEchoOfAVowPassiveModule([50, 0.1, 3, 2]);

  test("an Elemental Reaction the wielder causes raises its Elemental Mastery by the rank's amount for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    echoOfAVowPassiveModule.onKitEvent?.(
      createReaction(wielder, enemy, ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );

    expect(getBuffs(context.kitEffectState.effects)).toStrictEqual([
      {
        amount: 50,
        attribute: Attribute.ElementalMastery,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 3,
        source: "echoOfAVow",
      },
    ]);
  });

  test("a Stellar Glimmer reaction is an Elemental Reaction too, so it raises the Elemental Mastery and its Stellar Glimmer reaction DMG", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    echoOfAVowPassiveModule.onKitEvent?.(
      createReaction(wielder, enemy, ReactionType.StellarConduct, Element.Electro),
      context,
      wielder,
    );

    expect(getBuffs(context.kitEffectState.effects)).toStrictEqual([
      {
        amount: 50,
        attribute: Attribute.ElementalMastery,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 3,
        source: "echoOfAVow",
      },
      {
        amount: 0.1,
        attribute: Attribute.StellarGlimmerReactionDamageBonus,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 2,
        source: "echoOfAVow",
      },
    ]);
  });
});
