import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { computeEnemyStrikeDamage } from "#src/services/kit/computeEnemyStrikeDamage";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { strikePartyMember } from "#src/services/kit/strikePartyMember";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

describe(strikePartyMember, () => {
  const MAX_HEALTH = 1000;
  const DEFENSE = 100;
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([
      { attribute: Attribute.Health, value: MAX_HEALTH },
      { attribute: Attribute.Defense, value: DEFENSE },
    ]),
    characterId: 1,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };

  test("takes the share of the member's Max HP that an enemy's strike does through its defence", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const enemy = createEnemy(ENEMY_CAMP_MEMBER, "");
    const damage = computeEnemyStrikeDamage(enemy, combatant);

    strikePartyMember(party, enemy, combatant, { effects: [] });

    expect(getPartyMember(party, 1).healthShare).toBeCloseTo(1 - damage / MAX_HEALTH);
  });

  test("a shield takes an enemy's strike first, and the damage past its health is what the member loses", () => {
    expect.hasAssertions();

    const party = createParty([1]);
    const enemy = createEnemy(ENEMY_CAMP_MEMBER, "");
    const damage = computeEnemyStrikeDamage(enemy, combatant);
    const shieldHealth = damage / 2;
    const kitEffectState: KitEffectState = {
      effects: [{ characterId: 1, health: shieldHealth, kind: "shield", secondsRemaining: 12 }],
    };

    strikePartyMember(party, enemy, combatant, kitEffectState);

    expect(getPartyMember(party, 1).healthShare).toBeCloseTo(1 - (damage - shieldHealth) / MAX_HEALTH);
    expect(kitEffectState.effects).toStrictEqual([{ characterId: 1, health: 0, kind: "shield", secondsRemaining: 0 }]);
  });
});
