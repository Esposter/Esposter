import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { createParty } from "#src/services/party/createParty";
import { createDesertWatchPassiveModule } from "#src/services/weapon/passives/createDesertWatchPassiveModule";
import { createWeaponDamageTaken } from "#src/services/weapon/passives/createWeaponDamageTaken.test";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createDesertWatchPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([TRAVELER_CHARACTER_ID]);
  const wielder = createWielderCombatant();
  const other = { ...wielder, characterId: OTHER_CHARACTER_ID };
  // Desert Watch at its first rank: an Elemental Skill hit or damage the wielder takes raises its ATK by 20% for 8
  // Seconds, even Off the field, and its Max HP rises by 32% while it is not protected by a shield
  const passiveModule = createDesertWatchPassiveModule([0.2, 8, 0.2, 8, 0.32]);

  test("an Elemental Skill hit the wielder deals raises its ATK by the rank's amount for the rank's seconds", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder, { activeCombatant: other }), party: structuredClone(party) };
    passiveModule.onKitEvent?.(createWeaponDamageTaken(wielder, AttackTag.ElementalSkill, enemy), context, wielder);

    expect(
      getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap)
        .attributes.attributeTotalMap[Attribute.AttackPercent],
    ).toBe(0.2);

    stepKitSeconds(context, 8.1);

    expect(
      getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap)
        .attributes.attributeTotalMap[Attribute.AttackPercent],
    ).toBe(0);
  });

  test("damage the wielder takes raises its ATK by the rank's amount", () => {
    expect.hasAssertions();

    const context = { ...createKitTestContext(wielder), party: structuredClone(party) };
    passiveModule.onKitEvent?.(
      {
        isShielded: false,
        kind: KitEventKind.PartyMemberStruck,
        striker: enemy,
        struckCharacterId: wielder.characterId,
      },
      context,
      wielder,
    );

    expect(
      getBuffedCombatant(wielder, context.kitEffectState.effects, context.party, context.characterIdCombatantMap)
        .attributes.attributeTotalMap[Attribute.AttackPercent],
    ).toBe(0.2);
  });

  test("the rank's Max HP rises while the wielder is not protected by a shield", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);

    expect(
      passiveModule.getPassiveBonuses?.(
        wielder,
        1,
        [{ ...wielder, energy: 0, isOnField: true }],
        context.kitEffectState.effects,
      ),
    ).toStrictEqual([{ amount: 0.32, attribute: Attribute.HealthPercent }]);
  });
});
