import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createSethosKitBehaviour, SETHOS_CHARACTER_ID } from "#src/services/kit/characters/sethosKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const SETHOS_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, SETHOS_CHARACTER_ID);

describe(createSethosKitBehaviour, () => {
  test("reads the skill's cooldown, the burst's cooldown and cost, and the strikes' multipliers from his proud skill groups", () => {
    expect.hasAssertions();

    expect({
      burstCooldownSeconds: SETHOS_KIT.burstCooldownSeconds,
      burstEnergyCost: SETHOS_KIT.burstEnergyCost,
      multipliers: SETHOS_KIT.normalAttacks.map(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      skillCooldownSeconds: SETHOS_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      multipliers: [
        [expect.closeTo(0.5261, 3)],
        [expect.closeTo(0.238, 3), expect.closeTo(0.2661, 3)],
        [expect.closeTo(0.7399, 3)],
      ],
      skillCooldownSeconds: 8,
    });
  });

  test("the fully-charged Aimed Shot is his aimed, Electro charged attack at 74 frames, spending no stamina", () => {
    expect.hasAssertions();

    expect({
      gauge: SETHOS_KIT.chargedAttack.hits[0]?.gauge,
      hitmarkSeconds: SETHOS_KIT.chargedAttack.hits[0]?.hitmarkSeconds,
      isAimed: SETHOS_KIT.chargedAttack.isAimed,
      stamina: SETHOS_KIT.chargedAttackStamina,
    }).toStrictEqual({ gauge: 1, hitmarkSeconds: 74 / 60, isAimed: true, stamina: 0 });
  });
});
