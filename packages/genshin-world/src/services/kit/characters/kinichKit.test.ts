import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createKinichKit, KINICH_CHARACTER_ID } from "#src/services/kit/characters/kinichKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const KINICH_KIT = createKinichKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [KINICH_CHARACTER_ID]));

describe(createKinichKit, () => {
  test("reads each talent multiplier, cooldown and cost from his proud skill groups, to four decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...KINICH_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier),
      KINICH_KIT.chargedAttack.hits[0]?.talentMultiplier,
      KINICH_KIT.plungeCollision.talentMultiplier,
      KINICH_KIT.lowPlunge.hits[0]?.talentMultiplier,
      KINICH_KIT.highPlunge.hits[0]?.talentMultiplier,
      KINICH_KIT.elementalBurst.hits[0]?.talentMultiplier,
    ].map((multiplier) => Number(multiplier?.toFixed(4)));

    expect(multipliers).toStrictEqual([0.9899, 0.829, 1.235, 0.4842, 0.7459, 1.4914, 1.8629, 1.34]);
    expect([
      KINICH_KIT.chargedAttackStamina,
      KINICH_KIT.skillCooldownSeconds,
      KINICH_KIT.burstCooldownSeconds,
      KINICH_KIT.burstEnergyCost,
    ]).toStrictEqual([50, 18, 18, 70]);
  });

  test("lands his charged attack's three thrusts at their hitmarks, and his burst's hit at 161 frames", () => {
    expect.hasAssertions();
    expect({
      burstHitmarkSeconds: KINICH_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => hitmarkSeconds),
      chargedAttackHitmarkSeconds: KINICH_KIT.chargedAttack.hits.map(({ hitmarkSeconds }) => hitmarkSeconds),
    }).toStrictEqual({ burstHitmarkSeconds: [161 / 60], chargedAttackHitmarkSeconds: [71 / 60, 95 / 60, 119 / 60] });
  });
});
