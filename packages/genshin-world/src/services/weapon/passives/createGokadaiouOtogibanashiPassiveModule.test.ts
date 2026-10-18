import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createGokadaiouOtogibanashiPassiveModule } from "#src/services/weapon/passives/createGokadaiouOtogibanashiPassiveModule";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createGokadaiouOtogibanashiPassiveModule, () => {
  // Redhorn Stonethresher at its first rank: its DEF line is the table's, and Normal and Charged Attack hits deal 40% of DEF more as base damage
  const gokadaiouOtogibanashiPassiveModule = createGokadaiouOtogibanashiPassiveModule([0.28, 0.4]);
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseDefense, value: 1000 }]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const createStrike = (attackTag: AttackTag): KitStrike => ({
    attackTag,
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant: wielder,
    hit: TRAVELER_KIT.plungeCollision,
  });

  test("a normal or charged attack gains the rank's share of DEF as base damage", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    expect(
      [AttackTag.NormalAttack, AttackTag.ChargedAttack].map((attackTag) =>
        gokadaiouOtogibanashiPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
          createStrike(attackTag),
          enemy,
          context.party,
          context.kitEffectState.effects,
          context.characterIdCombatantMap,
        ),
      ),
    ).toStrictEqual([0.4 * wielder.attributes.defense, 0.4 * wielder.attributes.defense]);
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

    expect(
      gokadaiouOtogibanashiPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.NormalAttack),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toStrictEqual(0.4 * buffedDefense);
  });

  test("an elemental skill's strike gains no base damage", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    expect(
      gokadaiouOtogibanashiPassiveModule.getStrikeAdditiveBaseDamageBonus?.(
        createStrike(AttackTag.ElementalSkill),
        enemy,
        context.party,
        context.kitEffectState.effects,
        context.characterIdCombatantMap,
      ),
    ).toBe(0);
  });
});
