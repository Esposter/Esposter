import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CLORINDE_CHARACTER_ID, createClorindeKitBehaviour } from "#src/services/kit/characters/clorindeKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const CLORINDE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CLORINDE_CHARACTER_ID);

describe(createClorindeKitBehaviour, () => {
  test("reads the burst's cooldown and cost, the charged attack's stamina and the strikes' multipliers from her proud skill groups", () => {
    expect.hasAssertions();

    expect({
      burstCooldownSeconds: CLORINDE_KIT.burstCooldownSeconds,
      burstEnergyCost: CLORINDE_KIT.burstEnergyCost,
      chargedAttackStamina: CLORINDE_KIT.chargedAttackStamina,
      fifthStrike: CLORINDE_KIT.normalAttacks[4]?.hits[0]?.talentMultiplier,
      multipliers: CLORINDE_KIT.normalAttacks.slice(0, 2).map(({ hits }) => hits[0]?.talentMultiplier),
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 20,
      fifthStrike: expect.closeTo(0.9001, 3),
      multipliers: [expect.closeTo(0.5406, 3), expect.closeTo(0.5163, 3)],
    });
  });

  test("lightfall strikes five times, the last at 121 frames within its 128-frame animation", () => {
    expect.hasAssertions();

    expect({
      hitCount: CLORINDE_KIT.elementalBurst.hits.length,
      lastHitmarkSeconds: CLORINDE_KIT.elementalBurst.hits.at(-1)?.hitmarkSeconds,
    }).toStrictEqual({ hitCount: 5, lastHitmarkSeconds: 121 / 60 });
  });
});
