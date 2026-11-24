import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createAshenSunsShadowPassiveModule } from "#src/services/weapon/passives/createAshenSunsShadowPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWeaponStrike } from "#src/services/weapon/passives/createWeaponStrike.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createAshenSunsShadowPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createWielderCombatant();
  // Ashen Sun's Shadow at its first rank: a Charged Attack hit grants a Bond of Life of 25% Max HP, once every 14
  // Seconds, and while the wielder has one it deals 12% more DMG, and 24% more at a Bond of 30% Max HP or more
  const passiveModule = createAshenSunsShadowPassiveModule([0.25, 14, 0.12, 0.3, 0.24]);

  test("a Charged Attack hit grants the wielder a Bond of Life of the rank's share, which raises its DMG", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const context = { ...createKitTestContext(wielder), party };
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);

    expect(getPartyMember(party, wielder.characterId).bondOfLifeShare).toBe(0.25);
    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(0.12);
  });

  test("a Bond of Life at the rank's threshold raises the DMG further", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    getPartyMember(party, wielder.characterId).bondOfLifeShare = 0.3;
    const context = createKitTestContext(wielder);

    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBeCloseTo(0.36);
  });

  test("a second Charged Attack hit inside the rank's cooldown grants no second Bond of Life", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID]);
    const context = { ...createKitTestContext(wielder), party };
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);
    stepKitSeconds(context, 5);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);

    expect(getPartyMember(party, wielder.characterId).bondOfLifeShare).toBe(0.25);
  });
});
