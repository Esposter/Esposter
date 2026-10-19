import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createOathOfQhapaqNanPassiveModule } from "#src/services/weapon/passives/createOathOfQhapaqNanPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createOathOfQhapaqNanPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  // Synthetic params, not the weapon's row: a Pyro-related reaction from a party member raises the wielder's Elemental
  // Skill DMG by half for two seconds
  const oathOfQhapaqNanPassiveModule = createOathOfQhapaqNanPassiveModule([0.5, 2]);
  const wielder: Combatant = createWielderCombatant();
  const createReactionTriggered = (reactionType: ReactionType) => ({
    enemy,
    kind: KitEventKind.ReactionTriggered as const,
    reactions: [{ reactionType }],
    striker: wielder,
  });

  test("a Pyro-related reaction raises the wielder's Elemental Skill DMG and nothing else", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    oathOfQhapaqNanPassiveModule.onKitEvent?.(createReactionTriggered(ReactionType.Vaporize), context, wielder);

    expect(
      [AttackTag.ElementalSkill, AttackTag.NormalAttack].map((attackTag) =>
        oathOfQhapaqNanPassiveModule.getStrikeDamageBonus?.(
          createKitStrike(wielder, attackTag),
          enemy,
          context.party,
          context.kitEffectState.effects,
        ),
      ),
    ).toStrictEqual([0.5, 0]);
  });

  test("a reaction that is not Pyro-related raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    oathOfQhapaqNanPassiveModule.onKitEvent?.(createReactionTriggered(ReactionType.Quicken), context, wielder);

    expect(
      oathOfQhapaqNanPassiveModule.getStrikeDamageBonus?.(
        createKitStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
  });

  test("the Elemental Skill DMG raise ends after two seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    oathOfQhapaqNanPassiveModule.onKitEvent?.(createReactionTriggered(ReactionType.Melt), context, wielder);
    stepKitSeconds(context, 2.1);

    expect(
      oathOfQhapaqNanPassiveModule.getStrikeDamageBonus?.(
        createKitStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
  });
});
