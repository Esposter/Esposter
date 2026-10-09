import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { BENNETT_CHARACTER_ID } from "#src/services/character/constants";
import { createBennettKit } from "#src/services/kit/characters/bennettKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const BENNETT_KIT = createBennettKit(await readTalentMultipliers([BENNETT_CHARACTER_ID]));

const MAX_HEALTH = 10_000;
const BASE_ATTACK = 200;

const createBennettCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: MAX_HEALTH },
    { attribute: Attribute.BaseAttack, value: BASE_ATTACK },
  ]),
  characterId: BENNETT_CHARACTER_ID,
  elementalResonances: [],
  kit: BENNETT_KIT,
  level: 90,
});

describe("bennett kit", () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...BENNETT_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...BENNETT_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      BENNETT_KIT.plungeCollision.talentMultiplier,
      takeOne(BENNETT_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(BENNETT_KIT.highPlunge.hits).talentMultiplier,
      takeOne(BENNETT_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(BENNETT_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.4455, 0.4274, 0.5461, 0.5968, 0.719, 0.559, 0.6072, 0.6393, 1.2784, 1.5968, 1.376, 2.328,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("its field infuses the character on it from its first tick, and heals one under 70% of its HP from the second", () => {
    expect.hasAssertions();
    const combatant = createBennettCombatant();
    const party = createParty([BENNETT_CHARACTER_ID]);
    const body = { x: 0, z: 0 };
    const effects: KitEffect[] = [];
    BENNETT_KIT.elementalBurst.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, effects });

    // The first tick, at 34 frames, gives the ATK bonus of 56% of Bennett's base ATK, and no heal
    stepKitEffects(effects, 34 / 60, { activeCombatant: combatant, body, party });
    expect(effects.filter(({ kind }) => kind !== "field")).toStrictEqual([
      {
        amount: 0.56 * BASE_ATTACK,
        attribute: Attribute.Attack,
        characterId: BENNETT_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 126 / 60,
      },
      { characterId: BENNETT_CHARACTER_ID, element: Element.Pyro, kind: "infusion", secondsRemaining: 126 / 60 },
    ]);

    // The second tick, a second on, heals a character at half its HP by 577 plus 6% of Bennett's Max HP
    const partyMember = getPartyMember(party, BENNETT_CHARACTER_ID);
    partyMember.healthShare = 0.5;
    stepKitEffects(effects, 1, { activeCombatant: combatant, body, party });
    expect(partyMember.healthShare).toBeCloseTo(0.5 + (577.3388 + 0.06 * MAX_HEALTH) / MAX_HEALTH, 4);
  });
});
