import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrikeContext } from "#src/models/kit/KitStrikeContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { strikeElementalTicks } from "#src/services/kit/strikeElementalTicks";
import { createParty } from "#src/services/party/createParty";
import { noop } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

describe(strikeElementalTicks, () => {
  const LEVEL = 90;
  const STURDY_HEALTH = 1e9;
  const ELECTRO_CHARGED_TICK: Reaction = {
    element: Element.Electro,
    reactionType: TransformativeReactionType.ElectroCharged,
  };
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: LEVEL,
  };
  const tickDamage = getTransformativeDamage(
    TransformativeReactionType.ElectroCharged,
    LEVEL,
    0,
    getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId).elementResistances[Element.Electro],
  );

  const createSturdyEnemy = (x: number): Enemy => ({
    ...createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x, z: 0 } }, ""),
    health: STURDY_HEALTH,
    maxHealth: STURDY_HEALTH,
  });

  const createContext = (enemies: Enemy[]): KitStrikeContext => ({
    characterIdCombatantMap: new Map([[combatant.characterId, combatant]]),
    emit: noop,
    enemyMap: new Map(enemies.map((enemy, index) => [String(index), enemy])),
    enemyTables,
    kitEffectState: { effects: [] },
    party: createParty([combatant.characterId]),
    random: () => 0,
  });

  test("deals an Electro-Charged tick from the combatant that charged the enemy, arcing it to a Wet enemy beside it", () => {
    expect.hasAssertions();

    const charged = createSturdyEnemy(0);
    const wet = createSturdyEnemy(2);
    charged.electroChargedCombatant = combatant;
    charged.elementalReactions.push(ELECTRO_CHARGED_TICK);
    applyElement(wet.elementalState, Element.Hydro, 1);

    strikeElementalTicks(createContext([charged, wet]));

    expect(charged.maxHealth - charged.health).toBeCloseTo(tickDamage);
    expect(wet.maxHealth - wet.health).toBeCloseTo(tickDamage);
    expect(charged.elementalReactions).toStrictEqual([]);
  });

  test.each<[string, Combatant | undefined, Reaction]>([
    ["an Electro-Charged tick no combatant charged", undefined, ELECTRO_CHARGED_TICK],
    ["a Burning tick", combatant, { element: Element.Pyro, reactionType: TransformativeReactionType.Burning }],
  ])("deals nothing for %s, emptying the queue", (_, electroChargedCombatant, tick) => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy(0);
    enemy.electroChargedCombatant = electroChargedCombatant;
    enemy.elementalReactions.push(tick);

    strikeElementalTicks(createContext([enemy]));

    expect([enemy.health, enemy.elementalReactions]).toStrictEqual([STURDY_HEALTH, []]);
  });
});
