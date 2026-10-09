import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { KAEYA_CHARACTER_ID } from "#src/services/character/constants";
import { createKaeyaKit } from "#src/services/kit/characters/kaeyaKit";
import { healKitStriker } from "#src/services/kit/effects/healKitStriker";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const KAEYA_KIT = createKaeyaKit(await readTalentMultipliers([KAEYA_CHARACTER_ID]));

const createKaeyaCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: KAEYA_CHARACTER_ID,
  elementalResonances: [],
  kit: KAEYA_KIT,
  level: 90,
});

describe("kaeya kit", () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...KAEYA_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...KAEYA_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      KAEYA_KIT.plungeCollision.talentMultiplier,
      takeOne(KAEYA_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(KAEYA_KIT.highPlunge.hits).talentMultiplier,
      takeOne(KAEYA_KIT.elementalSkill.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.5375, 0.5169, 0.6527, 0.7086, 0.8824, 0.5504, 0.731, 0.6393, 1.2784, 1.5968, 1.912];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("its Glacial Waltz icicles land thirteen Cryo ticks at the wiki's 77.6%, and end with the summon", () => {
    expect.hasAssertions();
    const combatant = createKaeyaCombatant();
    const party = createParty([KAEYA_CHARACTER_ID]);
    const body = { x: 0, z: 0 };
    const kitEffectState: KitEffectState = { effects: [] };
    KAEYA_KIT.elementalBurst.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, kitEffectState });

    const icicles = stepKitEffects(kitEffectState, 9, { activeCombatant: combatant, body, party });
    expect(icicles).toHaveLength(13);
    expect(icicles.every(({ hit }) => hit.talentMultiplier === 0.776 && hit.element === "Ice")).toBe(true);
    expect(kitEffectState.effects).toStrictEqual([]);
  });

  test("ascension 1 heals Kaeya by 15% of his ATK for each enemy Frostgnaw strikes, and gives none before it", () => {
    expect.hasAssertions();
    const hit = takeOne(KAEYA_KIT.elementalSkill.hits);
    const combatant: Combatant = {
      ...createKaeyaCombatant(),
      ascension: 1,
      attributes: computeCharacterAttributes([
        { attribute: Attribute.BaseHealth, value: 10_000 },
        { attribute: Attribute.BaseAttack, value: 1000 },
      ]),
    };
    const party = createParty([KAEYA_CHARACTER_ID]);
    const partyMember = getPartyMember(party, KAEYA_CHARACTER_ID);
    partyMember.healthShare = 0.5;

    healKitStriker(party, combatant, hit);
    expect(partyMember.healthShare).toBeCloseTo(
      0.5 + (0.15 * combatant.attributes.attack) / combatant.attributes.maxHealth,
      5,
    );
    expect(hit.healAttackShare?.({ ...combatant, ascension: 0 })).toBe(0);
  });
});
