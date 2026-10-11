import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitDendroCore } from "#src/models/kit/KitDendroCore";
import type { KitStrikeContext } from "#src/models/kit/KitStrikeContext";
import type { Party } from "#src/models/party/Party";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { burstKitDendroCores } from "#src/services/kit/burstKitDendroCores";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { noop } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

const createCore = (reactionType: TransformativeReactionType, characterId = TRAVELER_CHARACTER_ID): KitDendroCore => ({
  characterId,
  kind: "dendroCore",
  position: { x: 0, z: 0 },
  reactionType,
  secondsRemaining: 0,
});

const getDamage = ({ health, maxHealth }: Enemy): number => maxHealth - health;

describe(burstKitDendroCores, () => {
  const LEVEL = 90;
  const STURDY_HEALTH = 1e9;
  const BENCHED_CHARACTER_ID = TRAVELER_CHARACTER_ID + 1;
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: LEVEL,
  };
  const dendroResistance = getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId).elementResistances[
    Element.Dendro
  ];

  const createSturdyEnemy = (x: number): Enemy => ({
    ...createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x, z: 0 } }, ""),
    health: STURDY_HEALTH,
    maxHealth: STURDY_HEALTH,
  });

  const createContext = (enemies: Enemy[], party = createParty([TRAVELER_CHARACTER_ID])): KitStrikeContext => ({
    characterIdCombatantMap: new Map([
      [BENCHED_CHARACTER_ID, { ...combatant, characterId: BENCHED_CHARACTER_ID }],
      [TRAVELER_CHARACTER_ID, combatant],
    ]),
    emit: noop,
    enemyMap: new Map(enemies.map((enemy, index) => [String(index), enemy])),
    enemyTables,
    kitEffectState: { effects: [] },
    party,
    random: () => 0,
  });

  test("bursts a Bloom's core on every enemy within 5 metres of its edge, and none past them", () => {
    expect.hasAssertions();

    const near = createSturdyEnemy(5.4);
    const far = createSturdyEnemy(5.5);

    burstKitDendroCores([createCore(TransformativeReactionType.Bloom)], createContext([near, far]));

    expect(getDamage(near)).toBeCloseTo(
      getTransformativeDamage(TransformativeReactionType.Bloom, LEVEL, 0, dendroResistance),
    );
    expect(far.health).toBe(STURDY_HEALTH);
  });

  test.each<[string, number, (party: Party) => void]>([
    [
      "is down",
      TRAVELER_CHARACTER_ID,
      (party) => {
        getPartyMember(party, TRAVELER_CHARACTER_ID).healthShare = 0;
      },
    ],
    ["stands out of the deployed team", BENCHED_CHARACTER_ID, noop],
  ])("bursts a Bloom's core on nothing while its character %s", (_description, characterId, changeParty) => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy(1);
    const party = createParty([TRAVELER_CHARACTER_ID]);
    changeParty(party);

    burstKitDendroCores([createCore(TransformativeReactionType.Bloom, characterId)], createContext([enemy], party));

    expect(enemy.health).toBe(STURDY_HEALTH);
  });

  test("lands a Hyperbloom on the enemy nearest its core within 15 metres and each enemy within a metre of it", () => {
    expect.hasAssertions();

    const nearest = createSturdyEnemy(10);
    const beside = createSturdyEnemy(11);
    const apart = createSturdyEnemy(13);
    const hyperbloomDamage = getTransformativeDamage(TransformativeReactionType.Hyperbloom, LEVEL, 0, dendroResistance);

    burstKitDendroCores([createCore(TransformativeReactionType.Hyperbloom)], createContext([apart, beside, nearest]));

    expect(getDamage(nearest)).toBeCloseTo(hyperbloomDamage);
    expect(getDamage(beside)).toBeCloseTo(hyperbloomDamage);
    expect(apart.health).toBe(STURDY_HEALTH);
  });
});
