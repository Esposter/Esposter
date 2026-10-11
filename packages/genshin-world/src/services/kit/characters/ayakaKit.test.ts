import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { AYAKA_CHARACTER_ID, createAyakaKit } from "#src/services/kit/characters/ayakaKit";
import { createKitState } from "#src/services/kit/createKitState";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const AYAKA_KIT = createAyakaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [AYAKA_CHARACTER_ID]));

const createAyakaCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: AYAKA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: AYAKA_KIT,
  level: 90,
});

describe(createAyakaKit, () => {
  test("reads each talent multiplier from her proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...AYAKA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...AYAKA_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      AYAKA_KIT.plungeCollision.talentMultiplier,
      takeOne(AYAKA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(AYAKA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(AYAKA_KIT.elementalSkill.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.4573, 0.4868, 0.6262, 0.2265, 0.2265, 0.2265, 0.7818, 0.5513, 0.5513, 0.5513, 0.6393, 1.2784, 1.5968, 2.392,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test.each([
    [0, [1]],
    [2, [1, 0.2, 0.2]],
  ])(
    "with %i constellations, Soumetsu's storms land nineteen Cryo cuts and a bloom each, at their shares %j of the wiki's 112.3% and 168.45%",
    (constellationCount, damageShares) => {
      expect.hasAssertions();
      const combatant = createAyakaCombatant(constellationCount);
      const kitEffectState: KitEffectState = { effects: [] };
      const context = createKitTestContext(combatant, { kitEffectState });
      AYAKA_KIT.elementalBurst.onStart?.(context);
      const strikes = stepKitEffects(7, context);

      expect(strikes.map(({ hit }) => hit.talentMultiplier)).toStrictEqual(
        damageShares.flatMap((damageShare) => [
          ...Array.from({ length: 19 }, () => damageShare * 1.123),
          damageShare * 1.6845,
        ]),
      );
      expect(strikes.every(({ hit }) => hit.element === Element.Cryo)).toBe(true);
      expect(kitEffectState.effects).toStrictEqual([]);
    },
  );

  test("restarts Senho's Cryo infusion on each step of the sprint, so it runs out 5 seconds after the sprint ends", () => {
    expect.hasAssertions();
    const combatant = createAyakaCombatant(0);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    const kitState = createKitState();
    AYAKA_KIT.onSprint?.(context, kitState);
    stepKitEffects(1, context);
    AYAKA_KIT.onSprint?.(context, kitState);

    expect(kitEffectState.effects).toStrictEqual([
      { characterId: AYAKA_CHARACTER_ID, element: Element.Cryo, kind: "infusion", secondsRemaining: 5 },
    ]);
  });
});
