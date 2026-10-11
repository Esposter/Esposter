import type { Reaction } from "#src/models/combat/Reaction";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ReactionType } from "#src/models/combat/ReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import {
  DENDRO_CORE_DROP_SECONDS,
  DENDRO_CORE_LIFETIME_SECONDS,
  MAX_DENDRO_CORE_COUNT,
} from "#src/services/combat/dendroCore/constants";
import { ENEMY_CAPSULE_RADIUS, ENEMY_DROP_OFFSET } from "#src/services/enemy/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { addDendroCores } from "#src/services/kit/addDendroCores";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

describe(addDendroCores, () => {
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
  const bloom: Reaction = { reactionType: ReactionType.Bloom };

  test("leaves a Bloom's core out from the enemy's edge, bursting as Bloom six seconds after it stands", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    addDendroCores(
      kitEffectState,
      enemy,
      combatant,
      [{ element: Element.Hydro, reactionType: ReactionType.Swirl }, bloom],
      () => 0.25,
    );

    expect(kitEffectState.effects).toStrictEqual([
      {
        characterId: TRAVELER_CHARACTER_ID,
        kind: "dendroCore",
        position: { x: 3 + ENEMY_CAPSULE_RADIUS + ENEMY_DROP_OFFSET, z: expect.closeTo(4) },
        reactionType: TransformativeReactionType.Bloom,
        secondsRemaining: DENDRO_CORE_DROP_SECONDS + DENDRO_CORE_LIFETIME_SECONDS,
      },
    ]);
  });

  test("bursts every core past the newest five as the newest stands", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    for (let index = 0; index <= MAX_DENDRO_CORE_COUNT; index += 1)
      addDendroCores(kitEffectState, enemy, combatant, [bloom], () => 0);

    expect(kitEffectState.effects.map(({ secondsRemaining }) => secondsRemaining)).toStrictEqual([
      DENDRO_CORE_DROP_SECONDS,
      ...Array.from({ length: MAX_DENDRO_CORE_COUNT }, () => DENDRO_CORE_DROP_SECONDS + DENDRO_CORE_LIFETIME_SECONDS),
    ]);
  });
});
