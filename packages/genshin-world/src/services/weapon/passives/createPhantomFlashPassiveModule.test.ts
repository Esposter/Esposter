import type { Combatant } from "#src/models/kit/Combatant";

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
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { createPhantomFlashPassiveModule } from "#src/services/weapon/passives/createPhantomFlashPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = createWielderCombatant();
// Snare Hook at its first rank: sixty Elemental Mastery for twelve seconds after a reaction, sixty more under Ascendant Gleam
const phantomFlashPassiveModule = createPhantomFlashPassiveModule([60, 12, 60, 0]);

describe(createPhantomFlashPassiveModule, () => {
  test("a reaction the wielder causes raises its Elemental Mastery by the rank's amount for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    phantomFlashPassiveModule.onKitEvent?.(
      {
        enemy,
        kind: KitEventKind.ReactionTriggered,
        reactions: [{ element: Element.Pyro, reactionType: ReactionType.Overloaded }],
        striker: wielder,
      },
      context,
      wielder,
    );

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 60,
        attribute: Attribute.ElementalMastery,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 12,
        source: "phantomFlash",
      },
    ]);
  });
});
