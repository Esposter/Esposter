import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import type { Combatant } from "#src/models/kit/Combatant";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createKinichKitBehaviour, KINICH_CHARACTER_ID } from "#src/services/kit/characters/kinichKit";
import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

const KINICH_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, KINICH_CHARACTER_ID);

const createKinichCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: KINICH_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KINICH_KIT,
  level: 90,
});

describe(createKinichKitBehaviour, () => {
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

  test("the burst calls the Ajaw, whose six lasers fall 145 or 150 frames apart as the world's random source draws", () => {
    expect.hasAssertions();
    const rolls = [0, 0.5, 0.99, 0.49, 0.75];
    const kitEffectState: KitEffectState = { effects: [] };
    KINICH_KIT.elementalBurst.onStart?.(
      createKitTestContext(
        {
          ascension: 0,
          attributes: computeCharacterAttributes([]),
          characterId: KINICH_CHARACTER_ID,
          constellationCount: 0,
          elementalResonances: [],
          kit: KINICH_KIT,
          level: 90,
        },
        { kitEffectState, random: () => rolls.shift() ?? 0 },
      ),
    );
    const ajaw = takeOne(kitEffectState.effects);
    assert(ajaw.kind === "summon");

    expect(ajaw.attackTag).toBe(AttackTag.ElementalBurst);
    expect(ajaw.hits.map(({ hitmarkSeconds }) => hitmarkSeconds * 60)).toStrictEqual([253, 398, 548, 698, 843, 993]);
    expect(Number(ajaw.hits[0]?.talentMultiplier.toFixed(4))).toBe(1.2074);
  });

  test("the skill's press enters the Nightsoul Blessing with no points, which gain two a second, and the blessing lasts ten and a sixth seconds", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createKinichCombatant());
    KINICH_KIT.elementalSkill.onStart?.(context);
    stepKitSeconds(context, 5);
    expect(countKitResource(context.kitEffectState.effects, KINICH_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBeCloseTo(10);
    stepKitSeconds(context, 6);
    expect(
      findKitStatus(context.kitEffectState.effects, KINICH_CHARACTER_ID, NIGHTSOUL_BLESSING_STATUS_ID),
    ).toBeUndefined();
    expect(countKitResource(context.kitEffectState.effects, KINICH_CHARACTER_ID, NIGHTSOUL_POINTS_ID)).toBe(0);
  });
});
