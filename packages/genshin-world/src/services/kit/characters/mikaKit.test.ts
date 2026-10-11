import type { KitAction } from "#src/models/kit/KitAction";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { createMikaKit, MIKA_CHARACTER_ID } from "#src/services/kit/characters/mikaKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const MIKA_KIT = createMikaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [MIKA_CHARACTER_ID]));

describe(createMikaKit, () => {
  test("reads the strikes', charged attack's, plunges' and skill's multipliers from his proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...MIKA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      MIKA_KIT.chargedAttack.hits[0]?.talentMultiplier,
      MIKA_KIT.plungeCollision.talentMultiplier,
      MIKA_KIT.lowPlunge.hits[0]?.talentMultiplier,
      MIKA_KIT.highPlunge.hits[0]?.talentMultiplier,
      MIKA_KIT.elementalSkill.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.432632, 0.415019, 0.545034, 0.276146, 0.276146, 0.708743, 1.12746, 0.639324, 1.278377, 1.596762, 0.672,
    ]);
  });

  test("his burst costs 70 energy and cools for 18 seconds, his charged attack costs 25 stamina, and his skill cools for 15 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: MIKA_KIT.burstCooldownSeconds,
      burstEnergyCost: MIKA_KIT.burstEnergyCost,
      chargedAttackStamina: MIKA_KIT.chargedAttackStamina,
      skillCooldownSeconds: MIKA_KIT.skillCooldownSeconds,
    }).toStrictEqual({ burstCooldownSeconds: 18, burstEnergyCost: 70, chargedAttackStamina: 25, skillCooldownSeconds: 15 });
  });

  test("his press strikes at 17 frames and his hold releases a flare at 12 frames from its own minimum half second", () => {
    expect.hasAssertions();
    const [hold] = MIKA_KIT.elementalSkillHolds ?? [];
    expect({
      holdHitmarkFrames: Math.round((hold?.action.hits[0]?.hitmarkSeconds ?? 0) * 60),
      holdMinimumHeldSeconds: hold?.minimumHeldSeconds,
      pressHitmarkFrames: Math.round((MIKA_KIT.elementalSkill.hits[0]?.hitmarkSeconds ?? 0) * 60),
    }).toStrictEqual({ holdHitmarkFrames: 12, holdMinimumHeldSeconds: 0.5, pressHitmarkFrames: 17 });
  });

  test("his strikes land their hits at 20, 14, 16, 15 and 24 frames, and his fifth strike at 30", () => {
    expect.hasAssertions();
    const hitmarks: number[] = MIKA_KIT.normalAttacks.flatMap((action: KitAction) =>
      action.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
    );
    expect(hitmarks).toStrictEqual([20, 14, 16, 15, 24, 30]);
  });
});
