import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_KIT } from "#src/services/kit/constants";
import { createParty } from "#src/services/party/createParty";
import { gainPartyEnergy } from "#src/services/party/gainPartyEnergy";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const PARTICLE_COUNT = 2;
const createCombatant = (characterId: number, element: Element): Combatant => ({
  attributes: computeCharacterAttributes([{ attribute: Attribute.EnergyRecharge, value: 1 }]),
  characterId,
  element,
  kit: TRAVELER_KIT,
  level: 1,
});

describe(gainPartyEnergy, () => {
  test("gives the member on the field its own element's energy and one off the field less", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    const characterIdCombatantMap = new Map([
      [1, createCombatant(1, Element.Pyro)],
      [2, createCombatant(2, Element.Hydro)],
    ]);

    gainPartyEnergy(
      party,
      { count: PARTICLE_COUNT, energyDropKind: EnergyDropKind.Particle, healthPercent: 50 },
      Element.Pyro,
      characterIdCombatantMap,
    );

    expect(getPartyMember(party, 1).energy).toBe(6);
    expect(getPartyMember(party, 2).energy).toBeCloseTo(1.6);
  });

  test("gives a fallen member none, and no member more than its burst costs", () => {
    expect.hasAssertions();

    const party = createParty([1, 2]);
    getPartyMember(party, 2).healthShare = 0;
    const characterIdCombatantMap = new Map([
      [1, createCombatant(1, Element.Pyro)],
      [2, createCombatant(2, Element.Pyro)],
    ]);

    gainPartyEnergy(
      party,
      { count: 100, energyDropKind: EnergyDropKind.Particle, healthPercent: 50 },
      Element.Pyro,
      characterIdCombatantMap,
    );

    expect(getPartyMember(party, 1).energy).toBe(TRAVELER_KIT.burstEnergyCost);
    expect(getPartyMember(party, 2).energy).toBe(0);
  });
});
