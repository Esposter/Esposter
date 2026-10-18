import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createBathhousesHawksAndNarukamiPassiveModule } from "#src/services/weapon/passives/createBathhousesHawksAndNarukamiPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const readElementalMastery = (context: KitContext, wielder: Combatant): number =>
  getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap).attributes
    .attributeTotalMap[Attribute.ElementalMastery];

describe(createBathhousesHawksAndNarukamiPassiveModule, () => {
  // Bathhouses, Hawks, and Narukami at its first rank: 120 Elemental Mastery for six seconds after a Swirl, 96 for nine
  // Seconds after an Elemental Skill hit and 32 for thirty seconds after an Elemental Burst hit
  const bathhousesHawksAndNarukamiPassiveModule = createBathhousesHawksAndNarukamiPassiveModule([
    120, 96, 32, 6, 9, 30, 0, 0,
  ]);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const createReactionTriggered = (reactionType: ReactionType, striker: Combatant) => ({
    enemy,
    kind: KitEventKind.ReactionTriggered as const,
    reactions: [{ reactionType }],
    striker,
  });
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("a Swirl its wielder triggers raises Elemental Mastery by the rank's amount for six seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    bathhousesHawksAndNarukamiPassiveModule.onKitEvent?.(
      createReactionTriggered(ReactionType.Swirl, wielder),
      context,
      wielder,
    );

    expect(readElementalMastery(context, wielder)).toBe(120);

    stepKitSeconds(context, 6.1);

    expect(readElementalMastery(context, wielder)).toBe(0);
  });

  test("a Stellar Swirl its wielder triggers raises Elemental Mastery the same way", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    bathhousesHawksAndNarukamiPassiveModule.onKitEvent?.(
      createReactionTriggered(ReactionType.StellarSwirl, wielder),
      context,
      wielder,
    );

    expect(readElementalMastery(context, wielder)).toBe(120);
  });

  test("a Swirl another party member triggers raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    bathhousesHawksAndNarukamiPassiveModule.onKitEvent?.(
      createReactionTriggered(ReactionType.Swirl, { ...wielder, characterId: 1 }),
      context,
      wielder,
    );

    expect(readElementalMastery(context, wielder)).toBe(0);
  });

  test("an Elemental Skill hit raises Elemental Mastery by the rank's amount for nine seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    bathhousesHawksAndNarukamiPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    expect(readElementalMastery(context, wielder)).toBe(96);

    stepKitSeconds(context, 9.1);

    expect(readElementalMastery(context, wielder)).toBe(0);
  });

  test("an Elemental Burst hit raises Elemental Mastery by the rank's amount for thirty seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    bathhousesHawksAndNarukamiPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalBurst), context, wielder);

    expect(readElementalMastery(context, wielder)).toBe(32);

    stepKitSeconds(context, 30.1);

    expect(readElementalMastery(context, wielder)).toBe(0);
  });

  test("a normal attack hit raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    bathhousesHawksAndNarukamiPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(readElementalMastery(context, wielder)).toBe(0);
  });
});
