import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";
import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TALENT_START_LEVELS } from "#src/services/character/constants";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { fightImaginariumKitStage } from "#src/services/imaginarium/fightImaginariumKitStage";
import { spawnImaginariumStageEnemies } from "#src/services/imaginarium/spawnImaginariumStageEnemies";
import { BARBARA_CHARACTER_ID } from "#src/services/kit/characters/barbaraKit";
import { BEIDOU_CHARACTER_ID } from "#src/services/kit/characters/beidouKit";
import { BENNETT_CHARACTER_ID } from "#src/services/kit/characters/bennettKit";
import { DILUC_CHARACTER_ID } from "#src/services/kit/characters/dilucKit";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { readCharacterKits } from "#src/services/kit/readCharacterKits";
import { describe, expect, test } from "vitest";

const PERFORMER_IDS = [DILUC_CHARACTER_ID, BEIDOU_CHARACTER_ID, BENNETT_CHARACTER_ID, BARBARA_CHARACTER_ID];
const kitMap = await readCharacterKits(
  GAME_DATA_LOCAL_BASE_URL,
  new Map(PERFORMER_IDS.map((characterId) => [characterId, TALENT_START_LEVELS])),
);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

// The stage's one enemy, a Hilichurl Fighter spawned from its kind at the level given
const createStageEnemies = (level: number) =>
  spawnImaginariumStageEnemies([EnemyKindId.HilichurlFighter], level, enemyTables);
// The four performers at the start of a stage, each with the Vigor given, in the order of their kits
const createPrincipalCast = (vigor: number): ImaginariumMember[] =>
  Array.from(kitMap.values(), (kit) => ({
    burstEnergyCost: kit.burstEnergyCost,
    energy: 0,
    healthShare: 1,
    isSpecialGuest: false,
    maxHealth: 0,
    vigor,
  }));
// A performer with the attack and health a stage gives, which a kit's damage is priced by
const createPerformers = (): Combatant[] =>
  Array.from(kitMap, ([characterId, kit]) => ({
    ...createKitCombatant(characterId, kit),
    attributes: computeCharacterAttributes([
      { attribute: Attribute.BaseAttack, value: 100 },
      { attribute: Attribute.BaseHealth, value: 1000 },
    ]),
  }));

describe(fightImaginariumKitStage, () => {
  // A stage's time limit, long enough for the four performers to clear the stage's enemy
  const TIME_LIMIT_MILLISECONDS = 60000;
  // A stage's time limit an enemy far above the performers outlasts
  const SHORT_TIME_LIMIT_MILLISECONDS = 5000;
  // The level the stage's enemy is fought at, and one far above the performers' that outlasts the short time limit
  const STAGE_LEVEL = 1;
  const FAR_ABOVE_LEVEL = 90;
  // The four performers after a fight they took part in: each spent its one point of Vigor and filled its Burst energy
  const PERFORMED_CAST: ImaginariumMember[] = [
    { burstEnergyCost: 40, energy: 40, healthShare: 1, isSpecialGuest: false, maxHealth: 0, vigor: 1 },
    { burstEnergyCost: 80, energy: 80, healthShare: 1, isSpecialGuest: false, maxHealth: 0, vigor: 1 },
    { burstEnergyCost: 60, energy: 60, healthShare: 1, isSpecialGuest: false, maxHealth: 0, vigor: 1 },
    { burstEnergyCost: 80, energy: 80, healthShare: 1, isSpecialGuest: false, maxHealth: 0, vigor: 1 },
  ];

  test("a stage is fought by four performers with Vigor", () => {
    expect.hasAssertions();

    const fight = fightImaginariumKitStage(
      createPrincipalCast(2),
      createPerformers(),
      createStageEnemies(STAGE_LEVEL),
      enemyTables,
      TIME_LIMIT_MILLISECONDS,
    );
    expect(fight).toStrictEqual({
      isFought: true,
      outcome: DomainChallengeOutcome.Cleared,
      principalCast: PERFORMED_CAST,
    });
  });

  test("a character with no Vigor cannot perform", () => {
    expect.hasAssertions();

    const principalCast = createPrincipalCast(0);

    expect(
      fightImaginariumKitStage(
        principalCast,
        createPerformers(),
        createStageEnemies(STAGE_LEVEL),
        enemyTables,
        TIME_LIMIT_MILLISECONDS,
      ),
    ).toStrictEqual({ isFought: false, principalCast });
  });

  test("a stage times out once its enemies outlast its time limit", () => {
    expect.hasAssertions();

    const fight = fightImaginariumKitStage(
      createPrincipalCast(2),
      createPerformers(),
      createStageEnemies(FAR_ABOVE_LEVEL),
      enemyTables,
      SHORT_TIME_LIMIT_MILLISECONDS,
    );

    expect(fight).toStrictEqual({
      isFought: true,
      outcome: DomainChallengeOutcome.TimedOut,
      principalCast: PERFORMED_CAST,
    });
  });
});
