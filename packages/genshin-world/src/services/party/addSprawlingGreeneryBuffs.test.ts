import type { Reaction } from "#src/models/combat/Reaction";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { addSprawlingGreeneryBuffs } from "#src/services/party/addSprawlingGreeneryBuffs";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers([TRAVELER_CHARACTER_ID]));

const createSprawlingGreeneryBuff = (amount: number, characterId: number): KitBuff => ({
  amount,
  attribute: Attribute.ElementalMastery,
  characterId,
  kind: "buff",
  secondsRemaining: 6,
  source: `Sprawling Greenery ${amount}`,
});

describe(addSprawlingGreeneryBuffs, () => {
  const PARTY_CHARACTER_IDS = [1, 2, 3, 4];
  const party = createParty(PARTY_CHARACTER_IDS);
  const dendroCombatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: takeOne(PARTY_CHARACTER_IDS, 0),
    constellationCount: 0,
    elementalResonances: [Element.Dendro],
    kit: TRAVELER_KIT,
    level: 90,
  };
  const quicken: Reaction = { reactionType: ReactionType.Quicken };
  const aggravate: Reaction = { reactionType: ReactionType.Aggravate };

  test("gives each party member 30 Elemental Mastery after a Quicken and 20 after an Aggravate", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    addSprawlingGreeneryBuffs(kitEffectState, party, dendroCombatant, [quicken]);
    addSprawlingGreeneryBuffs(kitEffectState, party, dendroCombatant, [aggravate]);

    expect(kitEffectState.effects).toStrictEqual([
      ...PARTY_CHARACTER_IDS.map((characterId) => createSprawlingGreeneryBuff(30, characterId)),
      ...PARTY_CHARACTER_IDS.map((characterId) => createSprawlingGreeneryBuff(20, characterId)),
    ]);
  });

  test("restarts a reaction's buff rather than stacking it, and lets the other amount run beside it", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    addSprawlingGreeneryBuffs(kitEffectState, party, dendroCombatant, [quicken]);
    for (const effect of kitEffectState.effects) effect.secondsRemaining = 2;
    addSprawlingGreeneryBuffs(kitEffectState, party, dendroCombatant, [quicken]);
    addSprawlingGreeneryBuffs(kitEffectState, party, dendroCombatant, [aggravate]);

    expect(kitEffectState.effects).toHaveLength(PARTY_CHARACTER_IDS.length * 2);
    expect(
      getBuffedCombatant(dendroCombatant, kitEffectState.effects).attributes.attributeTotalMap[
        Attribute.ElementalMastery
      ],
    ).toBe(50);
  });

  test("gives nothing without the Dendro resonance", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    addSprawlingGreeneryBuffs(kitEffectState, party, { ...dendroCombatant, elementalResonances: [] }, [quicken]);

    expect(kitEffectState.effects).toStrictEqual([]);
  });
});
