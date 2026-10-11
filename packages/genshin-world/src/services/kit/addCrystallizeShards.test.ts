import type { Reaction } from "#src/models/combat/Reaction";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import {
  CRYSTALLIZE_EXCESS_SHARD_SECONDS,
  CRYSTALLIZE_SHARD_DROP_SECONDS,
  CRYSTALLIZE_SHARD_LIMIT,
  CRYSTALLIZE_SHARD_SECONDS,
} from "#src/services/combat/shield/constants";
import { getCrystallizeShieldHealth } from "#src/services/combat/shield/getCrystallizeShieldHealth";
import { ENEMY_CAPSULE_RADIUS, ENEMY_DROP_OFFSET } from "#src/services/enemy/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { addCrystallizeShards } from "#src/services/kit/addCrystallizeShards";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

describe(addCrystallizeShards, () => {
  const LEVEL = 90;
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: LEVEL,
  };
  const enemy = createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x: 3, z: 4 } }, "");
  const hydroCrystallize: Reaction = { element: Element.Hydro, reactionType: ReactionType.Crystallize };

  test("drops a shard of a Crystallize's element half a metre out from the enemy's edge, holding its shield", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    addCrystallizeShards(
      kitEffectState,
      enemy,
      combatant,
      [{ element: Element.Hydro, reactionType: ReactionType.Swirl }, hydroCrystallize],
      () => 0.25,
    );

    expect(kitEffectState.effects).toStrictEqual([
      {
        characterId: TRAVELER_CHARACTER_ID,
        element: Element.Hydro,
        health: getCrystallizeShieldHealth(LEVEL, 0),
        kind: "crystallizeShard",
        position: { x: 3 + ENEMY_CAPSULE_RADIUS + ENEMY_DROP_OFFSET, z: expect.closeTo(4) },
        secondsRemaining: CRYSTALLIZE_SHARD_DROP_SECONDS + CRYSTALLIZE_SHARD_SECONDS,
      },
    ]);
  });

  test("leaves every shard past the newest three its last two seconds", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    for (let index = 0; index <= CRYSTALLIZE_SHARD_LIMIT; index += 1)
      addCrystallizeShards(kitEffectState, enemy, combatant, [hydroCrystallize], () => 0);

    expect(kitEffectState.effects.map(({ secondsRemaining }) => secondsRemaining)).toStrictEqual([
      CRYSTALLIZE_EXCESS_SHARD_SECONDS,
      ...Array.from(
        { length: CRYSTALLIZE_SHARD_LIMIT },
        () => CRYSTALLIZE_SHARD_DROP_SECONDS + CRYSTALLIZE_SHARD_SECONDS,
      ),
    ]);
  });
});
