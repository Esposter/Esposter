import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createParty } from "#src/services/party/createParty";
import { createSolarShinePassiveModule } from "#src/services/weapon/passives/createSolarShinePassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWeaponStrike } from "#src/services/weapon/passives/createWeaponStrike.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { getBuff } from "#src/services/weapon/passives/getBuff.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createSolarShinePassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant();
  // Solar Shine at its first rank: 20% Elemental Skill and Elemental Burst DMG after a normal attack, and 20% Normal Attack
  // DMG after an Elemental Skill or Elemental Burst
  const passiveModule = createSolarShinePassiveModule([0.2]);

  test("a normal attack hit raises the wielder's Elemental Skill and Elemental Burst DMG by the rank's amount", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);
    const { effects } = context.kitEffectState;

    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.ElementalSkill),
        enemy,
        party,
        effects,
      ),
    ).toBe(0.2);
    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.ElementalBurst),
        enemy,
        party,
        effects,
      ),
    ).toBe(0.2);
    expect(
      passiveModule.getStrikeDamageBonus?.(createWeaponStrike(wielder, AttackTag.NormalAttack), enemy, party, effects),
    ).toBe(0);
  });

  test("an Elemental Burst hit raises the wielder's Normal Attack DMG by the rank's amount for six seconds", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ElementalBurst, enemy), context, wielder);
    const buff = getBuff(context.kitEffectState, Attribute.NormalAttackDamageBonus);

    expect(buff?.amount).toBe(0.2);
    expect(buff?.secondsRemaining).toBe(6);
  });

  test("another member's hit raises nothing", () => {
    expect.hasAssertions();

    const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
    const context = createKitTestContext(wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(other, AttackTag.ElementalSkill, enemy), context, wielder);

    expect(context.kitEffectState.effects).toStrictEqual([]);
  });
});
