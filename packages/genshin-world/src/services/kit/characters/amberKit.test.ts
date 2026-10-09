import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { AMBER_CHARACTER_ID } from "#src/services/character/constants";
import { createAmberKit } from "#src/services/kit/characters/amberKit";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const AMBER_KIT = createAmberKit(await readTalentMultipliers([AMBER_CHARACTER_ID]));

const createAmberCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: AMBER_CHARACTER_ID,
  elementalResonances: [],
  kit: AMBER_KIT,
  level: 90,
});

describe("amber kit", () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...AMBER_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(AMBER_KIT.chargedAttack.hits).talentMultiplier,
      AMBER_KIT.plungeCollision.talentMultiplier,
      takeOne(AMBER_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(AMBER_KIT.highPlunge.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.3612, 0.3612, 0.4644, 0.473, 0.5934, 1.24, 0.5683, 1.1363, 1.4193];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("its Baron Bunny strikes nothing while it stands, then explodes once when its seconds run out", () => {
    expect.hasAssertions();
    const combatant = createAmberCombatant();
    const party = createParty([AMBER_CHARACTER_ID]);
    const body = { x: 0, z: 0 };
    const kitEffectState: KitEffectState = { effects: [] };
    AMBER_KIT.elementalSkill.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, kitEffectState });

    // Landing and the eight seconds after it leave the bunny standing until its timer runs out
    expect(stepKitEffects(kitEffectState, 8, { activeCombatant: combatant, body, party })).toStrictEqual([]);
    const explosions = stepKitEffects(kitEffectState, 1, { activeCombatant: combatant, body, party });
    expect(explosions.map(({ hit }) => hit.talentMultiplier)).toStrictEqual([1.232]);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("its Fiery Rain lands its eighteen arrows by the last wave, and nothing after", () => {
    expect.hasAssertions();
    const combatant = createAmberCombatant();
    const party = createParty([AMBER_CHARACTER_ID]);
    const body = { x: 0, z: 0 };
    const kitEffectState: KitEffectState = { effects: [] };
    AMBER_KIT.elementalBurst.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, kitEffectState });

    const arrows = stepKitEffects(kitEffectState, 4, { activeCombatant: combatant, body, party });
    expect(arrows).toHaveLength(18);
    expect(arrows.every(({ hit }) => hit.talentMultiplier === 0.2808)).toBe(true);
    expect(kitEffectState.effects).toStrictEqual([]);
  });
});
