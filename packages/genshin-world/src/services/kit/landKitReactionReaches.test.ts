import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { landKitReactionReaches } from "#src/services/kit/landKitReactionReaches";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test, vi } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(landKitReactionReaches, () => {
  test("sends the team's kits a defeat for a reach that takes an enemy's health to nothing", () => {
    expect.hasAssertions();

    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: { ...TRAVELER_KIT, onKitEvent },
      level: 90,
    };
    const origin = createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x: 0, z: 0 } }, "");
    const reached = createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x: 0.5, z: 0 } }, "");
    reached.health = 1;
    const context = createKitTestContext(combatant, {
      enemyMap: new Map([
        ["0", origin],
        ["1", reached],
      ]),
      enemyTables,
    });

    landKitReactionReaches(
      [[origin, { element: Element.Pyro, reactionType: TransformativeReactionType.Overloaded }]],
      combatant,
      context,
    );

    expect(onKitEvent.mock.calls.map(([event]) => event)).toContainEqual({
      enemy: reached,
      kind: KitEventKind.EnemyDefeated,
      striker: combatant,
    });
  });
});
