import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createFallIntoPlacePassiveModule } from "#src/services/weapon/passives/createFallIntoPlacePassiveModule";
import { createReaction, createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createFallIntoPlacePassiveModule, () => {
  const OTHER_CHARACTER_ID = 1;
  const MOONSIGN_KIT: Kit = { ...TRAVELER_KIT, moonsignBenediction: { lunarReactionTypes: [] } };
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  // Master Key with synthetic params: 40 Elemental Mastery for four seconds after a reaction, 30 more under
  // Ascendant Gleam
  const fallIntoPlacePassiveModule = createFallIntoPlacePassiveModule([40, 4, 30, 0]);

  test("a reaction the wielder causes raises its Elemental Mastery by the rank's amount for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    fallIntoPlacePassiveModule.onKitEvent?.(
      createReaction(wielder, enemy, ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 40,
        attribute: Attribute.ElementalMastery,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 4,
        source: "fallIntoPlace",
      },
    ]);
  });

  test("under Ascendant Gleam the wielder's Elemental Mastery is raised by the rank's moonsign amount more", () => {
    expect.hasAssertions();

    const moonsignWielder = { ...wielder, kit: MOONSIGN_KIT };
    const context = createKitTestContext(moonsignWielder, {
      characterIdCombatantMap: new Map([
        [TRAVELER_CHARACTER_ID, moonsignWielder],
        [OTHER_CHARACTER_ID, { ...wielder, characterId: OTHER_CHARACTER_ID, kit: MOONSIGN_KIT }],
      ]),
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });
    fallIntoPlacePassiveModule.onKitEvent?.(
      createReaction(moonsignWielder, enemy, ReactionType.Overloaded, Element.Pyro),
      context,
      moonsignWielder,
    );

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 70,
        attribute: Attribute.ElementalMastery,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 4,
        source: "fallIntoPlace",
      },
    ]);
  });

  test("a reaction another character causes raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    fallIntoPlacePassiveModule.onKitEvent?.(
      createReaction({ ...wielder, characterId: OTHER_CHARACTER_ID }, enemy, ReactionType.Overloaded, Element.Pyro),
      context,
      wielder,
    );

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
