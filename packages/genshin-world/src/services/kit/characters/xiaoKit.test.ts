import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID, XIAO_CHARACTER_ID } from "#src/services/character/constants";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { createXiaoKit } from "#src/services/kit/characters/xiaoKit";
import { getKitInfusion } from "#src/services/kit/effects/getKitInfusion";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const XIAO_KIT = createXiaoKit(await readTalentMultipliers([XIAO_CHARACTER_ID]));
const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers([TRAVELER_CHARACTER_ID]));

const createXiaoCombatant = (ascension: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: XIAO_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: XIAO_KIT,
  level: 90,
});

// Runs the team's effects on at the world's fixed step for the given seconds, as the world steps them
const stepEffects = (
  kitEffectState: KitEffectState,
  seconds: number,
  context: Parameters<typeof stepKitEffects>[2],
): KitStrike[] =>
  Array.from({ length: Math.round(seconds / FIXED_STEP_SECONDS) }, () =>
    stepKitEffects(kitEffectState, FIXED_STEP_SECONDS, context),
  ).flat();

describe(createXiaoKit, () => {
  const body = { x: 0, z: 0 };
  const kitBody = { facing: 0, height: 0, position: body };

  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const combatant = createXiaoCombatant(0);
    const party = createParty([XIAO_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    XIAO_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
    const dashStrikes = stepEffects(kitEffectState, 0.2, { activeCombatant: combatant, body, party });
    XIAO_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
    const multipliers = [
      ...XIAO_KIT.normalAttacks.flatMap((action) => action.hits.map(({ talentMultiplier }) => talentMultiplier)),
      takeOne(XIAO_KIT.chargedAttack.hits).talentMultiplier,
      XIAO_KIT.plungeCollision.talentMultiplier,
      takeOne(XIAO_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(XIAO_KIT.highPlunge.hits).talentMultiplier,
      ...dashStrikes.map(({ hit }) => hit.talentMultiplier),
      getKitInfusion(kitEffectState.effects, XIAO_CHARACTER_ID)?.damageBonus,
    ];
    const expectedMultipliers = [
      0.2754, 0.2754, 0.5694, 0.6855, 0.3766, 0.3766, 0.7154, 0.9583, 1.2109, 0.8183, 1.6363, 2.0439, 2.528, 0.5845,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test.each([
    [0, undefined],
    [1, 0.25],
  ])(
    "at Ascension %i, Bane of All Evil drains 3% of Xiao's HP each second and raises his Anemo DMG Bonus to %s",
    (ascension, tamerOfDemonsBonus) => {
      expect.hasAssertions();
      const combatant = createXiaoCombatant(ascension);
      const party = createParty([XIAO_CHARACTER_ID]);
      const context = { activeCombatant: combatant, body, party };
      const kitEffectState: KitEffectState = { effects: [] };
      XIAO_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
      // Tamer of Demons gives its last 5% at 12 seconds, and the burst stands until 57 frames past 15
      stepEffects(kitEffectState, 13, context);
      const buff = kitEffectState.effects.find((effect): effect is KitBuff => effect.kind === "buff");
      stepEffects(kitEffectState, 3, context);

      expect(buff?.amount).toBe(tamerOfDemonsBonus);
      expect(getPartyMember(party, XIAO_CHARACTER_ID).healthShare).toBeCloseTo(0.97 ** 14, 10);
      expect(kitEffectState.effects).toStrictEqual([]);
    },
  );

  test("leaving the field ends Bane of All Evil with its drain and Tamer of Demons' bonus", () => {
    expect.hasAssertions();
    const combatant = createXiaoCombatant(1);
    const party = createParty([XIAO_CHARACTER_ID, TRAVELER_CHARACTER_ID]);
    const travelerCombatant: Combatant = { ...combatant, characterId: TRAVELER_CHARACTER_ID, kit: TRAVELER_KIT };
    const kitEffectState: KitEffectState = { effects: [] };
    XIAO_KIT.elementalBurst.onStart?.({ body: kitBody, combatant, kitEffectState });
    // Xiao's HP drains at 1.95 and 2.95 seconds, and he leaves the field before the third
    stepEffects(kitEffectState, 3, { activeCombatant: combatant, body, party });
    stepEffects(kitEffectState, 13, { activeCombatant: travelerCombatant, body, party });

    expect(getPartyMember(party, XIAO_CHARACTER_ID).healthShare).toBeCloseTo(0.97 ** 2, 10);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test.each([
    [0, [0, 0, 0, 0, 0]],
    [4, [0, 1, 2, 3, 0]],
  ])(
    "at Ascension %i, four dashes a second apart and one 9 seconds after the last carry %j stacks of Heaven Fall's 15%",
    (ascension, stackCounts) => {
      expect.hasAssertions();
      const combatant = createXiaoCombatant(ascension);
      const party = createParty([XIAO_CHARACTER_ID]);
      const context = { activeCombatant: combatant, body, party };
      const kitEffectState: KitEffectState = { effects: [] };
      const waitSeconds = [1, 1, 1, 9, 1];
      const damageBonuses = waitSeconds.flatMap((seconds) => {
        XIAO_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
        return stepKitEffects(kitEffectState, seconds, context).map(({ hit }) => hit.damageBonus);
      });

      expect(damageBonuses).toStrictEqual(stackCounts.map((stacks) => (stacks === 0 ? undefined : 0.15 * stacks)));
    },
  );
});
