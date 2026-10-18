import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createReaction, createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { createSongOfTheVigilPassiveModule } from "#src/services/weapon/passives/createSongOfTheVigilPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = createWielderCombatant();
// Song of the Vigil at its first rank: four Energy for an elemental reaction once every nine seconds, and twenty per cent ATK for twelve seconds after a Stellar Glimmer reaction
const songOfTheVigilPassiveModule = createSongOfTheVigilPassiveModule([4, 0.2, 9, 12]);

describe(createSongOfTheVigilPassiveModule, () => {
  test("an elemental reaction the wielder triggers regenerates the rank's Energy to it", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    songOfTheVigilPassiveModule.onKitEvent?.(
      createReaction(wielder, enemy, ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(4);
  });

  test("the Energy comes once in the rank's cooldown, and again after it", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    songOfTheVigilPassiveModule.onKitEvent?.(
      createReaction(wielder, enemy, ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );
    songOfTheVigilPassiveModule.onKitEvent?.(
      createReaction(wielder, enemy, ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );
    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(4);

    stepKitSeconds(context, 9.5);
    songOfTheVigilPassiveModule.onKitEvent?.(
      createReaction(wielder, enemy, ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(8);
  });

  test("a Stellar Glimmer reaction raises the wielder's ATK by the rank's percentage for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    songOfTheVigilPassiveModule.onKitEvent?.(
      createReaction(wielder, enemy, ReactionType.StellarSwirl, Element.Anemo),
      context,
      wielder,
    );

    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual([
      {
        amount: 0.2,
        attribute: Attribute.AttackPercent,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 12,
        source: "songOfTheVigil",
      },
    ]);
  });

  test("an elemental reaction that is not a Stellar Glimmer one raises no ATK", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    songOfTheVigilPassiveModule.onKitEvent?.(
      createReaction(wielder, enemy, ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );

    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual([]);
  });
});
