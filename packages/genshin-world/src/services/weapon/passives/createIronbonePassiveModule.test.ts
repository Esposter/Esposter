import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { createIronbonePassiveModule } from "#src/services/weapon/passives/createIronbonePassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createIronbonePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant();

  // Ironbone at its first rank: 8% more CRIT Rate for an Elemental Skill, and 16% Energy Recharge for five seconds
  const passiveModule = createIronbonePassiveModule([0.08, 0.16, 5]);

  test.each([
    [AttackTag.ElementalSkill, 0.08],
    [AttackTag.NormalAttack, 0],
  ])("a strike of the kind %s gains %s CRIT Rate", (attackTag, criticalRateBonus) => {
    expect.hasAssertions();

    expect(passiveModule.getStrikeCriticalRateBonus?.(createKitStrike(wielder, attackTag), enemy, party, [])).toBe(
      criticalRateBonus,
    );
  });

  test("the wielder's Elemental Skill raises its Energy Recharge for five seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed }, context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: 0.16,
        attribute: Attribute.EnergyRecharge,
        characterId: TRAVELER_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 5,
        source: "ironbone",
      },
    ]);
  });
});
