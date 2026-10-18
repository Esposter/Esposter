import type { Combatant } from "#src/models/kit/Combatant";
import type { KitDendroCore } from "#src/models/kit/KitDendroCore";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { DendroCoreKind } from "#src/models/kit/DendroCoreKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { DENDRO_CORE_LIFETIME_SECONDS, HYPERBLOOM_FLIGHT_SECONDS } from "#src/services/combat/dendroCore/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeKitDendroCores } from "#src/services/kit/strikeKitDendroCores";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(strikeKitDendroCores, () => {
  const LEVEL = 90;
  const BLOOM_CORE_ID = 1;
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: LEVEL,
  };

  const createCore = (x: number, secondsRemaining = DENDRO_CORE_LIFETIME_SECONDS): KitDendroCore => ({
    characterId: BLOOM_CORE_ID,
    coreKind: DendroCoreKind.Bloom,
    kind: "dendroCore",
    position: { x, z: 0 },
    reactionType: TransformativeReactionType.Bloom,
    secondsRemaining,
  });

  const createStrike = (element: Element | undefined, gauge: number | undefined): KitStrike => ({
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant,
    hit: {
      element,
      gauge,
      hitArea: { angle: 2 * Math.PI, height: 2, radius: 2 },
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: 1,
    },
  });

  test.each<[Element, TransformativeReactionType, number]>([
    [Element.Electro, TransformativeReactionType.Hyperbloom, HYPERBLOOM_FLIGHT_SECONDS],
    [Element.Pyro, TransformativeReactionType.Burgeon, 0],
  ])("sets a standing core its %s reaches off as %s from the striker", (element, reactionType, secondsRemaining) => {
    expect.hasAssertions();

    const core = createCore(1);
    strikeKitDendroCores(
      { effects: [core] },
      createParty([TRAVELER_CHARACTER_ID]),
      createStrike(element, 1),
      combatant,
    );

    expect(core).toStrictEqual({
      ...createCore(1),
      characterId: TRAVELER_CHARACTER_ID,
      reactionType,
      secondsRemaining,
    });
  });

  test.each<Element>([Element.Electro, Element.Pyro])(
    "leaves a Bountiful Core as it is under a %s strike, as no reaction sends it off",
    (element) => {
      expect.hasAssertions();

      const core: KitDendroCore = { ...createCore(1), coreKind: DendroCoreKind.Bountiful, secondsRemaining: 0.4 };
      strikeKitDendroCores(
        { effects: [core] },
        createParty([TRAVELER_CHARACTER_ID]),
        createStrike(element, 1),
        combatant,
      );

      expect(core).toStrictEqual({ ...createCore(1), coreKind: DendroCoreKind.Bountiful, secondsRemaining: 0.4 });
    },
  );

  test.each<[string, KitDendroCore, KitStrike]>([
    ["a core not yet standing", createCore(1, DENDRO_CORE_LIFETIME_SECONDS + 0.1), createStrike(Element.Electro, 1)],
    ["a core past the hit's area", createCore(2.5), createStrike(Element.Electro, 1)],
    ["a Hydro hit", createCore(1), createStrike(Element.Hydro, 1)],
    ["a hit that applies no element", createCore(1), createStrike(Element.Electro, 0)],
    [
      "a hit landing on one enemy alone",
      createCore(1),
      { ...createStrike(Element.Electro, 1), target: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "") },
    ],
  ])("leaves %s as it is", (_description, core, strike) => {
    expect.hasAssertions();

    const { secondsRemaining } = core;
    strikeKitDendroCores({ effects: [core] }, createParty([TRAVELER_CHARACTER_ID]), strike, combatant);

    expect(core).toStrictEqual({ ...createCore(core.position.x), secondsRemaining });
  });
});
