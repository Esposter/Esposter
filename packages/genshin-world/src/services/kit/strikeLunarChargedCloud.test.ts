import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrikeContext } from "#src/models/kit/KitStrikeContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { strikeLunarChargedCloud } from "#src/services/kit/strikeLunarChargedCloud";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { LUNAR_CHARGED_CLOUD_SECONDS } from "#src/services/party/constants";
import { createParty } from "#src/services/party/createParty";
import { startPartyLunarReactions } from "#src/services/party/startPartyLunarReactions";
import { noop } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

describe(strikeLunarChargedCloud, () => {
  const STURDY_HEALTH = 1e9;
  const STEP_SECONDS = 0.1;
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
  };

  // An enemy at a distance along x, its Electro and Hydro lying together from the combatant's, as Lunar-Charged or not
  const createChargedEnemy = (x: number, isLunar: boolean): Enemy => {
    const enemy: Enemy = {
      ...createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, position: { x, z: 0 } }, ""),
      health: STURDY_HEALTH,
      maxHealth: STURDY_HEALTH,
    };
    const lunarReactionTypes = isLunar ? [LunarReactionType.LunarCharged] : [];
    applyElement(enemy.elementalState, Element.Hydro, 1, { lunarReactionTypes, sourceId: combatant.characterId });
    applyElement(enemy.elementalState, Element.Electro, 1, { lunarReactionTypes, sourceId: combatant.characterId });
    return enemy;
  };
  const createContext = (enemies: Enemy[]): KitStrikeContext => ({
    characterIdCombatantMap: new Map([[combatant.characterId, combatant]]),
    emit: noop,
    enemyMap: new Map(enemies.map((enemy, index) => [String(index), enemy])),
    enemyTables,
    kitEffectState: { effects: [] },
    party: createParty([combatant.characterId]),
    random: () => 0,
  });

  test("first ticks 9 frames on, striking Lunar-Charged enemies within 8 metres to their edge, each once in 2 seconds", () => {
    expect.hasAssertions();

    const near = createChargedEnemy(8.4, true);
    const far = createChargedEnemy(8.5, true);
    const electroCharged = createChargedEnemy(0, false);
    const context = createContext([near, far, electroCharged]);
    startPartyLunarReactions(context.party, [{ reactionType: ReactionType.LunarCharged }]);
    const nearHealths = Array.from({ length: 3 }, () => {
      strikeLunarChargedCloud(STEP_SECONDS, { x: 0, z: 0 }, context);
      return near.health;
    });

    expect(nearHealths[0]).toBe(STURDY_HEALTH);
    expect(nearHealths[1]).toBeLessThan(STURDY_HEALTH);
    expect(nearHealths[2]).toBe(nearHealths[1]);
    expect([far.health, electroCharged.health]).toStrictEqual([STURDY_HEALTH, STURDY_HEALTH]);
    expect(context.party.lunarChargedCloud.secondsRemaining).toBeCloseTo(
      LUNAR_CHARGED_CLOUD_SECONDS - 3 * STEP_SECONDS,
    );
  });
});
