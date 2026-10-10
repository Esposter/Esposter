import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { FISCHL_CHARACTER_ID } from "#src/services/character/constants";
import { createFischlKit } from "#src/services/kit/characters/fischlKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const FISCHL_KIT = createFischlKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [FISCHL_CHARACTER_ID]));

const createFischlCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: FISCHL_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: FISCHL_KIT,
  level: 90,
});

describe(createFischlKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  // The summons an action's start casts, as the kit's effects hold them
  const castSummons = (action: KitAction): KitSummon[] => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.({ body: kitBody, combatant: createFischlCombatant(), kitEffectState });
    return kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon");
  };

  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const [oz] = castSummons(FISCHL_KIT.elementalSkill);
    const multipliers = [
      ...FISCHL_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(FISCHL_KIT.chargedAttack.hits).talentMultiplier,
      FISCHL_KIT.plungeCollision.talentMultiplier,
      takeOne(FISCHL_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(FISCHL_KIT.highPlunge.hits).talentMultiplier,
      takeOne(oz?.hits ?? []).talentMultiplier,
      takeOne(oz?.hits.slice(1) ?? []).talentMultiplier,
      takeOne(FISCHL_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.4412, 0.4678, 0.5814, 0.5771, 0.7207, 1.24, 0.5683, 1.1363, 1.4193, 0.888, 1.1544, 2.08,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("the skill's Oz strikes at 38 frames on the press and attacks 10 times, the first at 92 frames", () => {
    expect.hasAssertions();
    const [oz] = castSummons(FISCHL_KIT.elementalSkill);
    const [summonHit, ...attackHits] = oz?.hits ?? [];

    expect(summonHit?.hitmarkSeconds).toBeCloseTo(38 / 60);
    expect(attackHits).toHaveLength(10);
    expect(attackHits[0]?.hitmarkSeconds).toBeCloseTo(92 / 60);
    expect(attackHits.at(-1)?.hitmarkSeconds).toBeCloseTo((92 + 9 * 59) / 60);
  });

  test("the burst's Oz attacks nine times from 192 frames, 59 frames apart", () => {
    expect.hasAssertions();
    const [oz] = castSummons(FISCHL_KIT.elementalBurst);

    expect(oz?.hits).toHaveLength(9);
    expect(oz?.hits[0]?.hitmarkSeconds).toBeCloseTo(192 / 60);
    expect(oz?.hits.at(-1)?.hitmarkSeconds).toBeCloseTo((192 + 8 * 59) / 60);
  });

  test("the skill's cooldown, the burst's cooldown and energy cost come from the dump's groups", () => {
    expect.hasAssertions();

    expect(FISCHL_KIT.skillCooldownSeconds).toBe(25);
    expect(FISCHL_KIT.burstCooldownSeconds).toBe(15);
    expect(FISCHL_KIT.burstEnergyCost).toBe(60);
  });
});
