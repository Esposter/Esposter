import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { getDamage } from "#src/services/combat/damage/getDamage";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { TRAVELER_KIT } from "#src/services/kit/characters/travelerKit";
import { strikePartyMember } from "#src/services/kit/strikePartyMember";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

describe(strikePartyMember, () => {
  const MAX_HEALTH = 1000;
  const DEFENSE = 100;
  const combatant: Combatant = {
    attributes: computeCharacterAttributes([
      { attribute: Attribute.Health, value: MAX_HEALTH },
      { attribute: Attribute.Defense, value: DEFENSE },
    ]),
    characterId: 1,
    kit: TRAVELER_KIT,
    level: 1,
  };

  test("takes the share of the member's Max HP that an enemy's strike does through its defence", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const enemy = createEnemy(ENEMY_CAMP_MEMBER, "");
    const damage = getDamage({
      attackerLevel: enemy.level,
      defense: DEFENSE,
      resistance: 0,
      stat: computeEnemyStats(getEnemyKind(enemy.enemyKindId), enemy.level).attack,
      talentMultiplier: 1,
    });

    strikePartyMember(party, enemy, combatant);

    expect(getPartyMember(party, 1).healthShare).toBeCloseTo(1 - damage / MAX_HEALTH);
  });
});
