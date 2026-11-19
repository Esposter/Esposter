import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { createBrocadeBloomShrineSwordPassiveModule } from "#src/services/weapon/passives/createBrocadeBloomShrineSwordPassiveModule";
import { createWeaponStrike } from "#src/services/weapon/passives/createWeaponStrike.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createBrocadeBloomShrineSwordPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant();
  const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
  // Brocade Bloom, Shrine Sword at its first rank: Normal Attack DMG 16% and Elemental Skill DMG 24%, both doubled for 15 seconds
  // After a nearby active character deals Geo DMG, and 20% DEF as a static line
  const passiveModule = createBrocadeBloomShrineSwordPassiveModule([0.2, 0.16, 0.24, 1, 15]);

  test("the wielder's Normal Attack and Elemental Skill DMG are raised by the rank's amounts", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    const { effects } = context.kitEffectState;

    expect(
      passiveModule.getStrikeDamageBonus?.(createWeaponStrike(wielder, AttackTag.NormalAttack), enemy, party, effects),
    ).toBe(0.16);
    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        party,
        effects,
      ),
    ).toBe(0.24);
  });

  test("a Geo hit by the active wielder doubles both for the rank's seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(
      {
        attackTag: AttackTag.ElementalSkill,
        element: Element.Geo,
        enemy,
        kind: KitEventKind.EnemyHit,
        striker: wielder,
      },
      context,
      wielder,
    );

    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.32);
    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.48);

    stepKitSeconds(context, 15.1);

    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.16);
  });

  test("a Geo hit by a member that is not on the field raises nothing", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(
      { attackTag: AttackTag.ElementalSkill, element: Element.Geo, enemy, kind: KitEventKind.EnemyHit, striker: other },
      context,
      wielder,
    );

    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.16);
  });
});
