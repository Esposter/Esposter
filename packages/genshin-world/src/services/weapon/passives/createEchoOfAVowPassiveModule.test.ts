import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

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
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createEchoOfAVowPassiveModule } from "#src/services/weapon/passives/createEchoOfAVowPassiveModule";
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
// Echo of a Vow at its first rank: sixty Elemental Mastery for twelve seconds after a reaction, and a Stellar Glimmer reaction
// DMG clause that is not built here, since the damage path reads no attribute for it
const echoOfAVowPassiveModule = createEchoOfAVowPassiveModule([60, 0.16, 12, 12]);
const createReaction = (reactionType: ReactionType, element: Element) => ({
  enemy,
  kind: KitEventKind.ReactionTriggered as const,
  reactions: [{ element, reactionType }],
  striker: wielder,
});
const getBuffs = (effects: readonly KitEffect[]) => effects.filter(({ kind }) => kind === "buff");

describe(createEchoOfAVowPassiveModule, () => {
  test("an Elemental Reaction the wielder causes raises its Elemental Mastery by the rank's amount for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    echoOfAVowPassiveModule.onKitEvent?.(createReaction(ReactionType.Overloaded, Element.Pyro), context, wielder);

    expect(getBuffs(context.kitEffectState.effects)).toStrictEqual([
      {
        amount: 60,
        attribute: Attribute.ElementalMastery,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 12,
        source: "echoOfAVow",
      },
    ]);
  });

  test("a Stellar Glimmer reaction is an Elemental Reaction too, and raises the Elemental Mastery alike", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    echoOfAVowPassiveModule.onKitEvent?.(
      createReaction(ReactionType.StellarConduct, Element.Electro),
      context,
      wielder,
    );

    expect(
      getBuffs(context.kitEffectState.effects).map(({ amount, attribute }) => ({ amount, attribute })),
    ).toStrictEqual([{ amount: 60, attribute: Attribute.ElementalMastery }]);
  });
});
