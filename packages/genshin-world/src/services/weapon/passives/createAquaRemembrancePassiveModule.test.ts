import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { createAquaRemembrancePassiveModule } from "#src/services/weapon/passives/createAquaRemembrancePassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWeaponStrike } from "#src/services/weapon/passives/createWeaponStrike.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createAquaRemembrancePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant();
  // Aqua Remembrance at its first rank: once every 15 seconds, for 14 seconds after an Elemental Skill, four Scorching Summer
  // Stacks, each raising Normal Attack DMG by 12%. A Normal Attack hit loses one stack and a Vaporize the wielder triggers
  // Gains one, each once every 1.5 seconds, up to four
  const passiveModule = createAquaRemembrancePassiveModule([0.2, 15, 14, 4, 0.12, 1.5, 1, 1.5]);
  const readNormalAttackBonus = (context: ReturnType<typeof createKitTestContext>) =>
    passiveModule.getStrikeDamageBonus?.(
      createWeaponStrike(wielder, AttackTag.NormalAttack),
      enemy,
      party,
      context.kitEffectState.effects,
    );

  test("an Elemental Skill of the wielder's gives four stacks, each raising its Normal Attack DMG by the rank's amount", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.({ characterId: wielder.characterId, kind: KitEventKind.SkillUsed }, context, wielder);

    expect(readNormalAttackBonus(context)).toBeCloseTo(0.48);
  });

  test("a Normal Attack hit loses a stack, and a Vaporize the wielder triggers gains one back", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.({ characterId: wielder.characterId, kind: KitEventKind.SkillUsed }, context, wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);

    expect(readNormalAttackBonus(context)).toBeCloseTo(0.36);

    passiveModule.onKitEvent?.(
      {
        enemy,
        kind: KitEventKind.ReactionTriggered,
        reactions: [{ reactionType: ReactionType.Vaporize }],
        striker: wielder,
      },
      context,
      wielder,
    );

    expect(readNormalAttackBonus(context)).toBeCloseTo(0.48);
  });

  test("the stacks end with the rank's seconds after the Elemental Skill", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.({ characterId: wielder.characterId, kind: KitEventKind.SkillUsed }, context, wielder);
    stepKitSeconds(context, 14.1);

    expect(readNormalAttackBonus(context)).toBe(0);
  });
});
