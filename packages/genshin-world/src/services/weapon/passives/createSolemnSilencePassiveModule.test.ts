import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";

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
import { createParty } from "#src/services/party/createParty";
import { createSolemnSilencePassiveModule } from "#src/services/weapon/passives/createSolemnSilencePassiveModule";
import { describe, expect, test } from "vitest";

const OTHER_CHARACTER_ID = 1;
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const MOONSIGN_KIT: Kit = { ...TRAVELER_KIT, moonsignBenediction: { lunarReactionTypes: [] } };
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
// Serenity's Call, Solemn Silence at its first rank: sixteen per cent Max HP for twelve seconds after a reaction, sixteen more under Ascendant Gleam
const solemnSilencePassiveModule = createSolemnSilencePassiveModule([0.16, 12, 0.16, 0]);
const createReaction = (striker: Combatant) => ({
  enemy,
  kind: KitEventKind.ReactionTriggered as const,
  reactions: [{ element: Element.Pyro, reactionType: ReactionType.Overloaded }],
  striker,
});

describe(createSolemnSilencePassiveModule, () => {
  test("a reaction the wielder causes raises its Max HP by the rank's percentage for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    solemnSilencePassiveModule.onKitEvent?.(createReaction(wielder), context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 0.16,
        attribute: Attribute.HealthPercent,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 12,
        source: "solemnSilence",
      },
    ]);
  });

  test("under Ascendant Gleam the wielder's Max HP is raised by the rank's moonsign percentage more", () => {
    expect.hasAssertions();

    const moonsignWielder = { ...wielder, kit: MOONSIGN_KIT };
    const context = createKitTestContext(moonsignWielder, {
      characterIdCombatantMap: new Map([
        [TRAVELER_CHARACTER_ID, moonsignWielder],
        [OTHER_CHARACTER_ID, { ...wielder, characterId: OTHER_CHARACTER_ID, kit: MOONSIGN_KIT }],
      ]),
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });
    solemnSilencePassiveModule.onKitEvent?.(createReaction(moonsignWielder), context, moonsignWielder);

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 0.32,
        attribute: Attribute.HealthPercent,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 12,
        source: "solemnSilence",
      },
    ]);
  });
});
