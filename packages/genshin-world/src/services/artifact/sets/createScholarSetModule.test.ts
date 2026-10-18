import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { SCHOLAR_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createScholarSetModule } from "#src/services/artifact/sets/createScholarSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { assert, describe, expect, test } from "vitest";

const BOW_CHARACTER_ID = 2;
const SWORD_CHARACTER_ID = 3;
const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wearer: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KIT,
  level: 1,
  weaponType: WeaponType.Catalyst,
};
const bowMember: Combatant = { ...wearer, characterId: BOW_CHARACTER_ID, weaponType: WeaponType.Bow };
const swordMember: Combatant = { ...wearer, characterId: SWORD_CHARACTER_ID, weaponType: WeaponType.Sword };
const bonusOf = (pieceCount: number) => {
  const bonus = statTables.artifactSetDataMap
    .get(SCHOLAR_ARTIFACT_SET_ID)
    ?.bonuses.find((b) => b.pieceCount === pieceCount);
  assert.exists(bonus);
  return bonus;
};

describe(createScholarSetModule, () => {
  test("gives 3 Energy to each member with a bow or a catalyst when particles are gathered, from four pieces", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID, BOW_CHARACTER_ID, SWORD_CHARACTER_ID]);
    const context = {
      ...createKitTestContext(wearer, { party }),
      characterIdCombatantMap: new Map(
        [wearer, bowMember, swordMember].map((combatant) => [combatant.characterId, combatant]),
      ),
    };
    const { onKitEvent } = createScholarSetModule(bonusOf(4));
    const particles = {
      characterId: TRAVELER_CHARACTER_ID,
      count: 3,
      energyDropKind: EnergyDropKind.Particle,
      kind: KitEventKind.EnergyParticleCollected,
    } as const;

    onKitEvent?.(particles, context, wearer);

    expect(getPartyMember(party, TRAVELER_CHARACTER_ID).energy).toBe(3);
    expect(getPartyMember(party, BOW_CHARACTER_ID).energy).toBe(3);
    expect(getPartyMember(party, SWORD_CHARACTER_ID).energy).toBe(0);
  });
});
