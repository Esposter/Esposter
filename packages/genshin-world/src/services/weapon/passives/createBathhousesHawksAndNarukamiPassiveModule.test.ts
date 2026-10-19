import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createBathhousesHawksAndNarukamiPassiveModule } from "#src/services/weapon/passives/createBathhousesHawksAndNarukamiPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const readElementalMastery = (context: KitContext, wielder: Combatant): number =>
  getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap).attributes
    .attributeTotalMap[Attribute.ElementalMastery];

describe(createBathhousesHawksAndNarukamiPassiveModule, () => {
  // Bathhouses, Hawks, and Narukami with synthetic params: 50 Elemental Mastery for two seconds after a Swirl, 40 for
  // Three seconds after an Elemental Skill hit and 30 for four seconds after an Elemental Burst hit
  const bathhousesHawksAndNarukamiPassiveModule = createBathhousesHawksAndNarukamiPassiveModule([50, 40, 30, 2, 3, 4]);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
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

  test("a Swirl its wielder triggers raises Elemental Mastery by the rank's amount for two seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    bathhousesHawksAndNarukamiPassiveModule.onKitEvent?.(
      createReactionTriggered(ReactionType.Swirl, wielder),
      context,
      wielder,
    );

    expect(readElementalMastery(context, wielder)).toBe(50);

    stepKitSeconds(context, 2.1);

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

    expect(readElementalMastery(context, wielder)).toBe(50);
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

  test("an Elemental Skill hit raises Elemental Mastery by the rank's amount for three seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    bathhousesHawksAndNarukamiPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    expect(readElementalMastery(context, wielder)).toBe(40);

    stepKitSeconds(context, 3.1);

    expect(readElementalMastery(context, wielder)).toBe(0);
  });

  test("an Elemental Burst hit raises Elemental Mastery by the rank's amount for four seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    bathhousesHawksAndNarukamiPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalBurst), context, wielder);

    expect(readElementalMastery(context, wielder)).toBe(30);

    stepKitSeconds(context, 4.1);

    expect(readElementalMastery(context, wielder)).toBe(0);
  });

  test("a normal attack hit raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    bathhousesHawksAndNarukamiPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(readElementalMastery(context, wielder)).toBe(0);
  });
});
