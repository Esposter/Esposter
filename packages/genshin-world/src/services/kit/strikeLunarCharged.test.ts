import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AuraType } from "#src/models/combat/AuraType";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { CharacterLevelMultiplierMap } from "#src/services/combat/damage/CharacterLevelMultiplierMap";
import { getLunarDamage } from "#src/services/combat/damage/getLunarDamage";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeLunarCharged } from "#src/services/kit/strikeLunarCharged";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(strikeLunarCharged, () => {
  const LEVEL = 90;
  const STURDY_HEALTH = 1e9;
  const SECOND_CHARACTER_ID = TRAVELER_CHARACTER_ID + 1;
  const createMember = (characterId: number, elementalMastery: number): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: elementalMastery }]),
    characterId,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: LEVEL,
  });
  const members = [createMember(TRAVELER_CHARACTER_ID, 0), createMember(SECOND_CHARACTER_ID, 100)];
  const kind = getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId);
  const getContribution = (elementalMastery: number): number =>
    getLunarDamage(LunarReactionType.LunarCharged, takeOne(CharacterLevelMultiplierMap, LEVEL), elementalMastery, 0, 0);

  const createSturdyEnemy = (): Enemy => ({
    ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    health: STURDY_HEALTH,
    maxHealth: STURDY_HEALTH,
  });
  const createContext = (enemy: Enemy): KitContext =>
    createKitTestContext(takeOne(members), {
      characterIdCombatantMap: new Map(members.map((member) => [member.characterId, member])),
      enemyMap: new Map([["", enemy]]),
      enemyTables,
      party: createParty(members.map(({ characterId }) => characterId)),
    });

  test("deals its contributors' damage, the largest weighted most, against Electro RES, taking 0.4U of each aura", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const lunarReactionTypes = [LunarReactionType.LunarCharged];
    applyElement(enemy.elementalState, Element.Hydro, 1, { lunarReactionTypes, sourceId: TRAVELER_CHARACTER_ID });
    applyElement(enemy.elementalState, Element.Electro, 1, { lunarReactionTypes, sourceId: SECOND_CHARACTER_ID });
    strikeLunarCharged(enemy, createContext(enemy));

    expect(STURDY_HEALTH - enemy.health).toBeCloseTo(
      (0.6 * getContribution(100) + 0.3 * getContribution(0)) *
        getResistanceMultiplier(kind.elementResistances[Element.Electro]),
    );
    expect(enemy.elementalState.auras.get(AuraType.Hydro)?.gauge).toBeCloseTo(0.4);
    expect(enemy.elementalState.auras.get(AuraType.Electro)?.gauge).toBeCloseTo(0.4);
  });

  test("strikes nothing where no member's Electro or Hydro stands in the enemy's auras", () => {
    expect.hasAssertions();

    const enemy = createSturdyEnemy();
    const lunarReactionTypes = [LunarReactionType.LunarCharged];
    applyElement(enemy.elementalState, Element.Hydro, 1, { lunarReactionTypes });
    applyElement(enemy.elementalState, Element.Electro, 1, { lunarReactionTypes });
    strikeLunarCharged(enemy, createContext(enemy));

    expect(enemy.health).toBe(STURDY_HEALTH);
    expect(enemy.elementalState.auras.get(AuraType.Electro)?.gauge).toBeCloseTo(0.8);
  });

  test("sends the team's kits a defeat for a Lunar-Charged hit that takes its enemy's health to nothing", () => {
    expect.hasAssertions();

    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const member: Combatant = { ...createMember(TRAVELER_CHARACTER_ID, 100), kit: { ...TRAVELER_KIT, onKitEvent } };
    const enemy = { ...createSturdyEnemy(), health: 1 };
    const lunarReactionTypes = [LunarReactionType.LunarCharged];
    applyElement(enemy.elementalState, Element.Hydro, 1, { lunarReactionTypes, sourceId: TRAVELER_CHARACTER_ID });
    applyElement(enemy.elementalState, Element.Electro, 1, { lunarReactionTypes, sourceId: TRAVELER_CHARACTER_ID });
    enemy.electroChargedCombatant = member;

    strikeLunarCharged(
      enemy,
      createKitTestContext(member, {
        characterIdCombatantMap: new Map([[member.characterId, member]]),
        enemyMap: new Map([["", enemy]]),
        enemyTables,
        party: createParty([member.characterId]),
      }),
    );

    expect(onKitEvent.mock.calls.map(([event]) => event)).toContainEqual({
      enemy,
      kind: KitEventKind.EnemyDefeated,
      striker: member,
    });
  });
});
