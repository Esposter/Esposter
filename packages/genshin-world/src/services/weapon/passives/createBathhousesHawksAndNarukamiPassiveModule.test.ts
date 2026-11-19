import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createBathhousesHawksAndNarukamiPassiveModule } from "#src/services/weapon/passives/createBathhousesHawksAndNarukamiPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { readElementalMastery } from "#src/services/weapon/passives/readElementalMastery.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createBathhousesHawksAndNarukamiPassiveModule, () => {
  // Bathhouses, Hawks, and Narukami with synthetic params: 50 Elemental Mastery for two seconds after a Swirl, 40 for
  // Three seconds after an Elemental Skill hit and 30 for four seconds after an Elemental Burst hit
  const bathhousesHawksAndNarukamiPassiveModule = createBathhousesHawksAndNarukamiPassiveModule([50, 40, 30, 2, 3, 4]);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = createWielderCombatant();
  const createReactionTriggered = (reactionType: ReactionType, striker: Combatant) => ({
    enemy,
    kind: KitEventKind.ReactionTriggered,
    reactions: [{ reactionType }],
    striker,
  });
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
    enemy,
    hit: TRAVELER_KIT.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken,
    striker: wielder,
  });

  test.each([ReactionType.Swirl, ReactionType.StellarSwirl])(
    "a %s its wielder triggers raises Elemental Mastery by the rank's amount for two seconds",
    (reactionType) => {
      expect.hasAssertions();

      const context = createKitTestContext(wielder);
      bathhousesHawksAndNarukamiPassiveModule.onKitEvent?.(
        createReactionTriggered(reactionType, wielder),
        context,
        wielder,
      );

      expect(readElementalMastery(context, wielder)).toBe(50);

      stepKitSeconds(context, 2.1);

      expect(readElementalMastery(context, wielder)).toBe(0);
    },
  );

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

  test.each([
    [AttackTag.ElementalSkill, 40, 3],
    [AttackTag.ElementalBurst, 30, 4],
  ])(
    "a %s hit its wielder lands raises Elemental Mastery by the rank's amount for the rank's seconds",
    (attackTag, amount, seconds) => {
      expect.hasAssertions();

      const context = createKitTestContext(wielder);
      bathhousesHawksAndNarukamiPassiveModule.onKitEvent?.(createDamageTaken(attackTag), context, wielder);

      expect(readElementalMastery(context, wielder)).toBe(amount);

      stepKitSeconds(context, seconds + 0.1);

      expect(readElementalMastery(context, wielder)).toBe(0);
    },
  );

  test("a normal attack hit raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    bathhousesHawksAndNarukamiPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(readElementalMastery(context, wielder)).toBe(0);
  });
});
