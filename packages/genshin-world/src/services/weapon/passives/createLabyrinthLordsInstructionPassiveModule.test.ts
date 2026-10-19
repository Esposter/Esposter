import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, stepKitSecondsSendingExpiries } from "#src/services/kit/createKitTestContext.test";
import { endKitSwapEffects } from "#src/services/kit/effects/endKitSwapEffects";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createLabyrinthLordsInstructionPassiveModule } from "#src/services/weapon/passives/createLabyrinthLordsInstructionPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createEnemyAt = (id: string, x: number): Enemy => ({
  ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, id),
  position: { x, z: 0 },
});

describe(createLabyrinthLordsInstructionPassiveModule, () => {
  // Labyrinth Lord's Instruction at its first rank: an Elemental Skill or Burst gives Teachings of the Forest, 60
  // Elemental Mastery for twelve seconds, once every twenty, and its end deals 100% ATK
  const passiveModule = createLabyrinthLordsInstructionPassiveModule([60, 12, 1, 20]);
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: getPassiveKit(TRAVELER_KIT, [passiveModule]),
    level: 1,
  };
  const createContext = (enemies: Enemy[] = []): KitContext =>
    createKitTestContext(wielder, { enemyMap: new Map(enemies.map((enemy) => [enemy.id, enemy])) });
  const useSkill = (context: KitContext, characterId = TRAVELER_CHARACTER_ID) =>
    passiveModule.onKitEvent?.({ characterId, kind: KitEventKind.SkillUsed }, context, wielder);
  const useBurst = (context: KitContext) =>
    passiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, energyCost: 60, kind: KitEventKind.BurstUsed },
      context,
      wielder,
    );
  const readBonuses = (context: KitContext) =>
    passiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects);

  test("the wielder's Elemental Skill or Burst gives it the rank's Elemental Mastery for twelve seconds", () => {
    expect.hasAssertions();

    const skillContext = createContext();
    const burstContext = createContext();
    useSkill(skillContext);
    useBurst(burstContext);
    const bonuses = [readBonuses(skillContext), readBonuses(burstContext)];
    stepKitSecondsSendingExpiries(skillContext, 12);

    expect(bonuses).toStrictEqual([
      [{ amount: 60, attribute: Attribute.ElementalMastery }],
      [{ amount: 60, attribute: Attribute.ElementalMastery }],
    ]);
    expect(readBonuses(skillContext)).toStrictEqual([]);
  });

  test("another member's Elemental Skill gives nothing", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context, OTHER_CHARACTER_ID);

    expect(readBonuses(context)).toStrictEqual([]);
  });

  test("as Teachings of the Forest runs out, a Physical hit at the rank's multiplier of ATK lands on the nearest enemy", () => {
    expect.hasAssertions();

    const nearest = createEnemyAt("nearest", 3);
    const context = createContext([createEnemyAt("farther", 8), nearest]);
    useSkill(context);
    stepKitSecondsSendingExpiries(context, 11.9);
    const strikeCountBeforeEnd = context.strikes.length;
    stepKitSecondsSendingExpiries(context, 0.1);

    expect(strikeCountBeforeEnd).toBe(0);
    expect(context.strikes).toHaveLength(1);
    expect(context.strikes[0]?.target).toBe(nearest);
    expect(context.strikes[0]?.hit.talentMultiplier).toBe(1);
    expect(context.strikes[0]?.hit.element).toBeUndefined();
  });

  test("the wielder leaving the field ends Teachings of the Forest and deals its hit", () => {
    expect.hasAssertions();

    const context = createContext([createEnemyAt("enemy", 3)]);
    useSkill(context);
    endKitSwapEffects(context.kitEffectState.effects, TRAVELER_CHARACTER_ID);
    stepKitSecondsSendingExpiries(context, FIXED_STEP_SECONDS);

    expect(readBonuses(context)).toStrictEqual([]);
    expect(context.strikes).toHaveLength(1);
  });

  test("an enemy past 15 metres is not struck", () => {
    expect.hasAssertions();

    const context = createContext([createEnemyAt("enemy", 30)]);
    useSkill(context);
    stepKitSecondsSendingExpiries(context, 12);

    expect(context.strikes).toHaveLength(0);
  });

  test("a burst inside the twenty-second cooldown gives nothing, and one after it does", () => {
    expect.hasAssertions();

    const context = createContext();
    useSkill(context);
    stepKitSecondsSendingExpiries(context, 13);
    useBurst(context);
    const bonusesInsideCooldown = readBonuses(context);
    stepKitSecondsSendingExpiries(context, 7);
    useBurst(context);

    expect(bonusesInsideCooldown).toStrictEqual([]);
    expect(readBonuses(context)).toStrictEqual([{ amount: 60, attribute: Attribute.ElementalMastery }]);
  });
});
