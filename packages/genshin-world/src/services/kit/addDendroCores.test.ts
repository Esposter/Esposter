import type { Reaction } from "#src/models/combat/Reaction";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ReactionType } from "#src/models/combat/ReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { DendroCoreKind } from "#src/models/kit/DendroCoreKind";
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
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { GOLDEN_CHALICE_BOUNTY_STATUS_ID } from "#src/services/party/constants";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

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
        coreKind: DendroCoreKind.Bloom,
        kind: "dendroCore",
        position: { x: 3 + ENEMY_CAPSULE_RADIUS + ENEMY_DROP_OFFSET, z: expect.closeTo(4) },
        reactionType: TransformativeReactionType.Bloom,
        secondsRemaining: DENDRO_CORE_DROP_SECONDS + DENDRO_CORE_LIFETIME_SECONDS,
      },
    ]);
  });

  test("leaves a Lunar-Bloom the same core as a Bloom, bursting as Bloom", () => {
    expect.hasAssertions();

    const bloomState: KitEffectState = { effects: [] };
    const lunarBloomState: KitEffectState = { effects: [] };
    addDendroCores(bloomState, enemy, combatant, [bloom], () => 0);
    addDendroCores(lunarBloomState, enemy, combatant, [{ reactionType: ReactionType.LunarBloom }], () => 0);

    expect(lunarBloomState.effects).toStrictEqual(bloomState.effects);
  });

  test("leaves a Bloom's core as a Bountiful Core, bursting 0.4 seconds on, under Golden Chalice's Bounty", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = {
      effects: [
        {
          characterId: TRAVELER_CHARACTER_ID,
          id: GOLDEN_CHALICE_BOUNTY_STATUS_ID,
          kind: "status",
          secondsRemaining: 30,
        },
      ],
    };
    addDendroCores(kitEffectState, enemy, combatant, [bloom], () => 0.25);

    expect(kitEffectState.effects.filter(({ kind }) => kind === "dendroCore")).toStrictEqual([
      {
        characterId: TRAVELER_CHARACTER_ID,
        coreKind: DendroCoreKind.Bountiful,
        kind: "dendroCore",
        position: { x: 3 + ENEMY_CAPSULE_RADIUS + ENEMY_DROP_OFFSET, z: expect.closeTo(4) },
        reactionType: TransformativeReactionType.Bloom,
        secondsRemaining: 0.4,
      },
    ]);
  });

  test("leaves a Bloom's core as a Bloom core once the Golden Chalice's Bounty has run out", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = {
      effects: [
        {
          characterId: TRAVELER_CHARACTER_ID,
          id: GOLDEN_CHALICE_BOUNTY_STATUS_ID,
          kind: "status",
          secondsRemaining: 0,
        },
      ],
    };
    addDendroCores(kitEffectState, enemy, combatant, [bloom], () => 0.25);

    expect(kitEffectState.effects.filter(({ kind }) => kind === "dendroCore")).toStrictEqual([
      {
        characterId: TRAVELER_CHARACTER_ID,
        coreKind: DendroCoreKind.Bloom,
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
