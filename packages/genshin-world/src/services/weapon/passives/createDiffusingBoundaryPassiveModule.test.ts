import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { OTHER_CHARACTER_ID } from "#src/services/kit/constants.test";
import { createKitStrike } from "#src/services/kit/createKitStrike.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { createParty } from "#src/services/party/createParty";
import { createDiffusingBoundaryPassiveModule } from "#src/services/weapon/passives/createDiffusingBoundaryPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createDiffusingBoundaryPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const deployed = (isOnField: boolean): DeployedCombatant[] => [createDeployedCombatant(wielder, { isOnField })];
  const liveShield: KitEffect = { characterId: OTHER_CHARACTER_ID, health: 100, kind: "shield", secondsRemaining: 5 };

  // Diffusing Boundary at its first rank: while the wielder is protected by a shield, its Normal and Charged Attacks
  // Deal 20% more DMG and take 8% more CRIT Rate
  const passiveModule = createDiffusingBoundaryPassiveModule([0.2, 0.08]);

  test("while a shield protects the wielder on the field, its Normal and Charged Attacks deal 20% more DMG", () => {
    expect.hasAssertions();

    expect(passiveModule.getPassiveBonuses?.(wielder, 1, deployed(true), [liveShield])).toStrictEqual([
      { amount: 0.2, attribute: Attribute.NormalAttackDamageBonus },
      { amount: 0.2, attribute: Attribute.ChargedAttackDamageBonus },
    ]);
    expect(passiveModule.getPassiveBonuses?.(wielder, 1, deployed(true), [])).toStrictEqual([]);
    expect(passiveModule.getPassiveBonuses?.(wielder, 1, deployed(false), [liveShield])).toStrictEqual([]);
  });

  test.each([
    [AttackTag.NormalAttack, 0, [liveShield], 0.08],
    [AttackTag.ChargedAttack, 0, [liveShield], 0.08],
    [AttackTag.ElementalSkill, 0, [liveShield], 0],
    [AttackTag.NormalAttack, 0, [], 0],
    [AttackTag.NormalAttack, 1, [liveShield], 0],
  ])(
    "a strike of the kind %s with the member at %s on the field takes the CRIT Rate a shield gives",
    (attackTag, activeIndex, effects, criticalRateBonus) => {
      expect.hasAssertions();

      const party = createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]);
      party.activeIndex = activeIndex;

      expect(
        passiveModule.getStrikeCriticalRateBonus?.(createKitStrike(wielder, attackTag), enemy, party, effects),
      ).toBe(criticalRateBonus);
    },
  );
});
