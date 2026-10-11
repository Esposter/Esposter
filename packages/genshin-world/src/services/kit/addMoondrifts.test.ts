import type { Reaction } from "#src/models/combat/Reaction";
import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { addMoondrifts } from "#src/services/kit/addMoondrifts";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import {
  MOONDRIFT_HARMONY_COOLDOWN_SECONDS,
  MOONDRIFT_HARMONY_HIT_SECONDS,
  MOONDRIFT_OFFSETS,
  MOONDRIFT_SECONDS,
} from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(addMoondrifts, () => {
  const SOURCE_ID = TRAVELER_CHARACTER_ID + 1;
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
  };
  const lunarCrystallize: Reaction = {
    element: Element.Hydro,
    reactionType: ReactionType.LunarCrystallize,
    sourceIds: [SOURCE_ID],
  };
  const origin = { x: 0, z: 0 };

  test("leaves three Moondrifts about the enemy, then resonates a Harmony on the third Lunar-Crystallize", () => {
    expect.hasAssertions();

    const party = createParty([combatant.characterId]);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    addMoondrifts(party, enemy, combatant, [lunarCrystallize], origin);
    const moondrifts = structuredClone(party.lunarCrystallize.moondrifts);
    addMoondrifts(party, enemy, combatant, [lunarCrystallize], origin);
    const hitCountBefore = enemy.moondriftHarmonyHits.length;
    addMoondrifts(party, enemy, combatant, [lunarCrystallize], origin);

    expect(moondrifts).toStrictEqual(
      MOONDRIFT_OFFSETS.map((offset) => ({
        position: { x: enemy.position.x + offset.x, z: enemy.position.z + offset.z },
        secondsRemaining: MOONDRIFT_SECONDS,
      })),
    );
    expect(hitCountBefore).toBe(0);
    expect(enemy.moondriftHarmonyHits).toStrictEqual(
      MOONDRIFT_HARMONY_HIT_SECONDS.map((secondsRemaining) => ({
        contributorIds: new Set([combatant.characterId, SOURCE_ID]),
        ownerId: combatant.characterId,
        secondsRemaining,
      })),
    );
    expect(party.lunarCrystallize).toStrictEqual({
      contributorIds: new Set(),
      count: 0,
      harmonyCooldownSeconds: MOONDRIFT_HARMONY_COOLDOWN_SECONDS,
      moondrifts,
    });
  });

  test("leaves three more where none stands within 20 metres of the character on the field", () => {
    expect.hasAssertions();

    const party = createParty([combatant.characterId]);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    addMoondrifts(party, enemy, combatant, [lunarCrystallize], origin);
    addMoondrifts(party, enemy, combatant, [lunarCrystallize], { x: enemy.position.x + 30, z: enemy.position.z });

    expect(party.lunarCrystallize.moondrifts).toHaveLength(2 * MOONDRIFT_OFFSETS.length);
  });
});
