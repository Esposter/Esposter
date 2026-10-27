import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createEvernightDuetPassiveModule } from "#src/services/weapon/passives/createEvernightDuetPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { getBuff } from "#src/services/weapon/passives/getBuff.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createEvernightDuetPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  // Evernight Duet with synthetic params: 32% Elemental Skill DMG for four seconds after a normal attack, 24% Normal
  // Attack DMG for six seconds after an Elemental Skill
  const evernightDuetPassiveModule = createEvernightDuetPassiveModule([0.32, 4, 0.24, 6]);
  const wielder: Combatant = createWielderCombatant();
  const createDamageTaken = (attackTag: AttackTag) => ({
    attackTag,
    enemy,
    hit: wielder.kit.plungeCollision,
    isCritical: false,
    isDefeated: false,
    kind: KitEventKind.DamageTaken as const,
    striker: wielder,
  });

  test("a normal attack hit raises the wielder's Elemental Skill DMG and nothing else", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    evernightDuetPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);

    expect(
      [AttackTag.ElementalSkill, AttackTag.NormalAttack].map((attackTag) =>
        evernightDuetPassiveModule.getStrikeDamageBonus?.(
          createKitStrike(wielder, attackTag),
          enemy,
          context.party,
          kitEffectState.effects,
        ),
      ),
    ).toStrictEqual([0.32, 0]);
    expect(getBuff(kitEffectState, Attribute.NormalAttackDamageBonus)).toBeUndefined();
  });

  test("an Elemental Skill hit raises the wielder's Normal Attack DMG by the rank's second amount", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wielder, { kitEffectState });
    evernightDuetPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.ElementalSkill), context, wielder);

    expect(getBuff(kitEffectState, Attribute.NormalAttackDamageBonus)).toStrictEqual({
      amount: 0.24,
      attribute: Attribute.NormalAttackDamageBonus,
      characterId: wielder.characterId,
      kind: "buff",
      secondsRemaining: 6,
      source: "evernightDuetElementalSkill",
    });
    expect(
      evernightDuetPassiveModule.getStrikeDamageBonus?.(
        createKitStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        context.party,
        kitEffectState.effects,
      ),
    ).toBe(0);
  });

  test("the Elemental Skill DMG raise ends after its seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    evernightDuetPassiveModule.onKitEvent?.(createDamageTaken(AttackTag.NormalAttack), context, wielder);
    stepKitSeconds(context, 4.1);

    expect(
      evernightDuetPassiveModule.getStrikeDamageBonus?.(
        createKitStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
      ),
    ).toBe(0);
  });
});
