import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { createWindUnattainedPassiveModule } from "#src/services/weapon/passives/createWindUnattainedPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const readAttributeTotal = (context: KitContext, wielder: Combatant, attribute: Attribute): number =>
  getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap).attributes
    .attributeTotalMap[attribute];

describe(createWindUnattainedPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
  // The Wind Unattained at its first rank: 12% ATK and 48 Elemental Mastery for 10 seconds after an Elemental Reaction
  const passiveModule = createWindUnattainedPassiveModule([0.12, 48, 10]);

  test("an Elemental Reaction raises the wielder's ATK and Elemental Mastery for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(
      {
        enemy,
        kind: KitEventKind.ReactionTriggered,
        reactions: [{ reactionType: ReactionType.Vaporize }],
        striker: other,
      },
      context,
      wielder,
    );

    expect(readAttributeTotal(context, wielder, Attribute.AttackPercent)).toBe(0.12);
    expect(readAttributeTotal(context, wielder, Attribute.ElementalMastery)).toBe(48);

    stepKitSeconds(context, 10.1);

    expect(readAttributeTotal(context, wielder, Attribute.AttackPercent)).toBe(0);
    expect(readAttributeTotal(context, wielder, Attribute.ElementalMastery)).toBe(0);
  });

  test("an attack hit that is not a reaction raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(other, AttackTag.NormalAttack, enemy), context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
