import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getKitHealedHp } from "#src/services/kit/getKitHealedHp";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const member: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KIT,
  level: 1,
};
const combatantMap = new Map([[TRAVELER_CHARACTER_ID, member]]);

describe(getKitHealedHp, () => {
  test("counts the HP a heal restores as its share of the healed member's Max HP", () => {
    expect.hasAssertions();

    expect(
      getKitHealedHp(
        {
          bondOfLifeShare: 0,
          characterId: TRAVELER_CHARACTER_ID,
          healthShare: 0.25,
          kind: KitEventKind.HealthChanged,
          overflowHealthShare: 0,
        },
        combatantMap,
      ),
    ).toBe(0.25 * member.attributes.maxHealth);
  });

  test("counts the overflow past full HP, which a heal on a member at full HP leaves", () => {
    expect.hasAssertions();

    expect(
      getKitHealedHp(
        {
          bondOfLifeShare: 0,
          characterId: TRAVELER_CHARACTER_ID,
          healthShare: 0,
          kind: KitEventKind.HealthChanged,
          overflowHealthShare: 0.1,
        },
        combatantMap,
      ),
    ).toBe(0.1 * member.attributes.maxHealth);
  });

  test("counts the share a Bond of Life took before the HP was restored", () => {
    expect.hasAssertions();

    expect(
      getKitHealedHp(
        {
          bondOfLifeShare: 0.2,
          characterId: TRAVELER_CHARACTER_ID,
          healthShare: 0.1,
          kind: KitEventKind.HealthChanged,
          overflowHealthShare: 0,
        },
        combatantMap,
      ),
    ).toBe(0.3 * member.attributes.maxHealth);
  });

  test("heals nothing for a drain, or for a member the team does not build", () => {
    expect.hasAssertions();

    const drain = {
      bondOfLifeShare: 0,
      characterId: TRAVELER_CHARACTER_ID,
      healthShare: -0.2,
      kind: KitEventKind.HealthChanged,
      overflowHealthShare: 0,
    } as const;

    expect(getKitHealedHp(drain, combatantMap)).toBe(0);
    expect(getKitHealedHp({ ...drain, healthShare: 0.2 }, new Map())).toBe(0);
  });
});
