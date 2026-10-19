import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { createGokadaiouOtogibanashiPassiveModule } from "#src/services/weapon/passives/createGokadaiouOtogibanashiPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createGokadaiouOtogibanashiPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  // Redhorn Stonethresher with synthetic params: its first, a DEF line the module does not read, is passed as 0, and
  // Normal and Charged Attack hits deal 30% of DEF more as base damage
  const gokadaiouOtogibanashiPassiveModule = createGokadaiouOtogibanashiPassiveModule([0, 0.3]);
  const wielder: Combatant = createWielderCombatant([{ attribute: Attribute.BaseDefense, value: 1000 }]);

  test("a normal or charged attack gains the rank's share of DEF as base damage", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    expect(
      [AttackTag.NormalAttack, AttackTag.ChargedAttack].map((attackTag) =>
        gokadaiouOtogibanashiPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
          createKitStrike(wielder, attackTag),
          enemy,
          context.party,
          context.kitEffectState.effects,
          context.characterIdCombatantMap,
        ),
      ),
    ).toStrictEqual([0.3 * wielder.attributes.defense, 0.3 * wielder.attributes.defense]);
  });

  test("the share is the wielder's DEF with its buffs on", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    buffKitMember(context.kitEffectState, TRAVELER_CHARACTER_ID, {
      amount: 0.5,
      attribute: Attribute.DefensePercent,
      secondsRemaining: 12,
      source: "test",
    });
    const { attributeTotalMap } = wielder.attributes;
    const buffedDefense =
      attributeTotalMap[Attribute.BaseDefense] * (1 + attributeTotalMap[Attribute.DefensePercent] + 0.5) +
      attributeTotalMap[Attribute.Defense];

    // The strike carries the wielder as the hit prices it, with its buffs on
    const pricedWielder = getBuffedCombatant(
      wielder,
      context.kitEffectState.effects,
      context.party,
      context.characterIdCombatantMap,
    );
    expect(
      gokadaiouOtogibanashiPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createKitStrike(pricedWielder, AttackTag.NormalAttack),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toStrictEqual(0.3 * buffedDefense);
  });

  test("an elemental skill's strike gains no base damage", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    expect(
      gokadaiouOtogibanashiPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createKitStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0);
  });
});
