import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createSongOfTheVigilPassiveModule } from "#src/services/weapon/passives/createSongOfTheVigilPassiveModule";
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
// Song of the Vigil at its first rank: four Energy for an elemental reaction once every nine seconds, and twenty per cent ATK for twelve seconds after a Stellar Glimmer reaction
const songOfTheVigilPassiveModule = createSongOfTheVigilPassiveModule([4, 0.2, 9, 12]);
const createReaction = (reactionType: ReactionType, element: Element) => ({
  enemy,
  kind: KitEventKind.ReactionTriggered as const,
  reactions: [{ element, reactionType }],
  striker: wielder,
});

describe(createSongOfTheVigilPassiveModule, () => {
  test("an elemental reaction the wielder triggers regenerates the rank's Energy to it", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    songOfTheVigilPassiveModule.onKitEvent?.(createReaction(ReactionType.Overloaded, Element.Pyro), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(4);
  });

  test("the Energy comes once in the rank's cooldown, and again after it", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    songOfTheVigilPassiveModule.onKitEvent?.(createReaction(ReactionType.Overloaded, Element.Pyro), context, wielder);
    songOfTheVigilPassiveModule.onKitEvent?.(createReaction(ReactionType.Overloaded, Element.Pyro), context, wielder);
    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(4);

    stepKitSeconds(context, 9.5);
    songOfTheVigilPassiveModule.onKitEvent?.(createReaction(ReactionType.Overloaded, Element.Pyro), context, wielder);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(8);
  });

  test("a Stellar Glimmer reaction raises the wielder's ATK by the rank's percentage for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    songOfTheVigilPassiveModule.onKitEvent?.(
      createReaction(ReactionType.StellarSwirl, Element.Anemo),
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
    songOfTheVigilPassiveModule.onKitEvent?.(createReaction(ReactionType.Overloaded, Element.Pyro), context, wielder);

    expect(context.kitEffectState.effects.filter(({ kind }) => kind === "buff")).toStrictEqual([]);
  });
});
