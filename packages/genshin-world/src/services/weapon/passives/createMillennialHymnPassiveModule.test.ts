import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { createMillennialHymnPassiveModule } from "#src/services/weapon/passives/createMillennialHymnPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const readElementalMastery = (context: KitContext, wielder: Combatant): number =>
  getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap).attributes
    .attributeTotalMap[Attribute.ElementalMastery];

describe(createMillennialHymnPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
  const createSkillHit = (element: Element) => ({
    attackTag: AttackTag.ElementalSkill,
    element,
    enemy,
    kind: KitEventKind.EnemyHit,
    striker: wielder,
  });
  const createLunarBloomTriggered = (striker: Combatant) => ({
    enemy,
    kind: KitEventKind.ReactionTriggered,
    reactions: [{ reactionType: ReactionType.LunarBloom }],
    striker,
  });
  // Millennial Hymn at its first rank: 60 Elemental Mastery for 4.5 seconds after an Elemental Skill of Hydro or Dendro, and
  // For 10 seconds after a nearby member's Lunar-Bloom, both together raising the party's Bloom DMG by 120%
  const passiveModule = createMillennialHymnPassiveModule([60, 10, 60, 4.5, 1.2, 0.8, 0.4]);

  test("an Elemental Skill of Hydro or Dendro raises the wielder's Elemental Mastery for the rank's first seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createSkillHit(Element.Hydro), context, wielder);

    expect(readElementalMastery(context, wielder)).toBe(60);

    stepKitSeconds(context, 4.6);

    expect(readElementalMastery(context, wielder)).toBe(0);
  });

  test("a nearby member's Lunar-Bloom raises the wielder's Elemental Mastery for the rank's second seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createLunarBloomTriggered(other), context, wielder);

    expect(readElementalMastery(context, wielder)).toBe(60);

    stepKitSeconds(context, 5);

    expect(readElementalMastery(context, wielder)).toBe(60);
  });

  test("with both in effect, every Bloom reaction of the party gains its amount, and nothing without both", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const bloomReaction = { combatant: other, enemy, reactionType: ReactionType.Bloom };

    expect(passiveModule.getPartyReactionBonus?.(wielder, bloomReaction, context)?.damageBonus).toBeUndefined();

    passiveModule.onKitEvent?.(createSkillHit(Element.Dendro), context, wielder);
    passiveModule.onKitEvent?.(createLunarBloomTriggered(other), context, wielder);

    expect(passiveModule.getPartyReactionBonus?.(wielder, bloomReaction, context)?.damageBonus).toBe(1.2);
    expect(
      passiveModule.getPartyReactionBonus?.(
        wielder,
        { combatant: other, enemy, reactionType: ReactionType.Burgeon },
        context,
      )?.damageBonus,
    ).toBe(0.8);
  });
});
