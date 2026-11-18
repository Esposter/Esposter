import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createReaction } from "#src/services/weapon/passives/createReaction.test";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWhispersOfWindAndFlowerPassiveModule } from "#src/services/weapon/passives/createWhispersOfWindAndFlowerPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { getBuff } from "#src/services/weapon/passives/getBuff.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createWhispersOfWindAndFlowerPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
  // Whispers of Wind and Flower at its first rank: for eight seconds after the wielder's Elemental Skill hits or its own
  // Reaction, 12% ATK and 48 Elemental Mastery
  const passiveModule = createWhispersOfWindAndFlowerPassiveModule([8, 0.12, 48]);

  test("an Elemental Skill hit the wielder deals raises its ATK and Elemental Mastery by the rank's amounts", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ElementalSkill, enemy), context, wielder);

    expect(getBuff(context.kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.12);
    expect(getBuff(context.kitEffectState, Attribute.ElementalMastery)?.amount).toBe(48);
    expect(getBuff(context.kitEffectState, Attribute.ElementalMastery)?.secondsRemaining).toBe(8);
  });

  test("a reaction the wielder triggers raises the same buffs", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createReaction(wielder, enemy, ReactionType.Vaporize, Element.Pyro), context, wielder);

    expect(getBuff(context.kitEffectState, Attribute.AttackPercent)?.amount).toBeCloseTo(0.12);
    expect(getBuff(context.kitEffectState, Attribute.ElementalMastery)?.amount).toBe(48);
  });

  test("another member's Elemental Skill hit and its reaction raise nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(other, AttackTag.ElementalSkill, enemy), context, wielder);
    passiveModule.onKitEvent?.(createReaction(other, enemy, ReactionType.Vaporize, Element.Pyro), context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
