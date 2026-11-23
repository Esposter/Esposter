import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { createWanderingStrikerPassiveModule } from "#src/services/weapon/passives/createWanderingStrikerPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWeaponStrike } from "#src/services/weapon/passives/createWeaponStrike.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createWanderingStrikerPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant([
    { attribute: Attribute.BaseAttack, value: 100 },
    { attribute: Attribute.BaseHealth, value: 1000 },
  ]);
  // Wandering Striker at its first rank: an attack hit releases an Accursed Spirit at 180% ATK, once every 8 seconds,
  // Restoring 100% ATK as HP, and the wielder's DMG is decreased by 50%
  const passiveModule = createWanderingStrikerPassiveModule([1.8, 1, 8, -0.5], { heals: true });

  test("an attack hit the wielder deals queues an Accursed Spirit at the rank's multiplier on the enemy it struck", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);

    expect(context.strikes).toStrictEqual([
      {
        body: context.body,
        combatant: wielder,
        hit: { hitArea: SMALL_AOE_AREA, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier: 1.8 },
        target: enemy,
      },
    ]);
  });

  test("the Accursed Spirit restores the wielder its ATK share as HP, and a hit inside the cooldown queues nothing", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    getPartyMember(context.party, wielder.characterId).healthShare = 0.5;
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ChargedAttack, enemy), context, wielder);
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.PlungingAttack, enemy), context, wielder);

    expect(context.strikes).toHaveLength(1);
    expect(getPartyMember(context.party, wielder.characterId).healthShare).toBe(0.6);
  });

  test("the wielder's own strikes are decreased by the rank's amount", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);

    expect(
      passiveModule.getStrikeDamageBonus?.(
        createWeaponStrike(wielder, AttackTag.NormalAttack),
        enemy,
        party,
        context.kitEffectState.effects,
      ),
    ).toBe(-0.5);
  });

  test("the rank without a heal queues the Accursed Spirit and restores nothing", () => {
    expect.hasAssertions();

    const healless = createWanderingStrikerPassiveModule([1.8, 8, -0.5], { heals: false });
    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    getPartyMember(context.party, wielder.characterId).healthShare = 0.5;
    healless.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.NormalAttack, enemy), context, wielder);

    expect(context.strikes).toHaveLength(1);
    expect(getPartyMember(context.party, wielder.characterId).healthShare).toBe(0.5);
  });
});
