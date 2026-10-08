import type { EnergyRecipient } from "#src/models/combat/EnergyRecipient";

import { Element } from "#src/models/Element";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { getEnergyGain } from "#src/services/combat/energy/getEnergyGain";
import { describe, expect, test } from "vitest";

describe(getEnergyGain, () => {
  const recipient: EnergyRecipient = { element: Element.Pyro, energyRecharge: 1, isActive: true, partySize: 4 };

  test.each<[EnergyDropKind, Element | undefined, boolean, number, number]>([
    [EnergyDropKind.Particle, Element.Pyro, true, 4, 3],
    [EnergyDropKind.Particle, Element.Hydro, true, 4, 1],
    [EnergyDropKind.Particle, undefined, true, 4, 2],
    [EnergyDropKind.Orb, Element.Pyro, true, 4, 9],
    [EnergyDropKind.Orb, undefined, true, 4, 6],
    [EnergyDropKind.Particle, Element.Pyro, false, 4, 1.8],
    [EnergyDropKind.Orb, Element.Hydro, false, 3, 2.1],
    [EnergyDropKind.Particle, undefined, false, 2, 1.6],
  ])(
    "gives a Pyro member a %s of %s, on the field %s in a party of %i, %f energy",
    (energyDropKind, dropElement, isActive, partySize, energy) => {
      expect.hasAssertions();

      expect(getEnergyGain(energyDropKind, { ...recipient, isActive, partySize }, dropElement)).toBeCloseTo(energy);
    },
  );

  test("multiplies the energy by the member's energy recharge", () => {
    expect.hasAssertions();

    expect(getEnergyGain(EnergyDropKind.Particle, { ...recipient, energyRecharge: 1.5 }, Element.Pyro)).toBe(4.5);
  });
});
