import type { EnergyRecipient } from "#src/models/combat/EnergyRecipient";
import type { Element } from "#src/models/Element";

import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import {
  CLEAR_PARTICLE_ENERGY,
  INACTIVE_ENERGY_LOSS_PER_PARTY_MEMBER,
  ORB_PARTICLE_COUNT,
  OTHER_ELEMENT_PARTICLE_ENERGY,
  SAME_ELEMENT_PARTICLE_ENERGY,
} from "#src/services/combat/energy/constants";

// The energy a party member gains from a particle or an orb of an element, or of none: by whether it matches theirs,
// Cut for a member off the field by the party's size, and multiplied by their energy recharge. What it adds to their
// Energy stops at their burst's cost, and the burst spends it all
export const getEnergyGain = (
  energyDropKind: EnergyDropKind,
  { element, energyRecharge, isActive, partySize }: EnergyRecipient,
  dropElement?: Element,
): number => {
  const particleEnergy = dropElement
    ? dropElement === element
      ? SAME_ELEMENT_PARTICLE_ENERGY
      : OTHER_ELEMENT_PARTICLE_ENERGY
    : CLEAR_PARTICLE_ENERGY;
  const particleCount = energyDropKind === EnergyDropKind.Orb ? ORB_PARTICLE_COUNT : 1;
  const share = isActive ? 1 : 1 - INACTIVE_ENERGY_LOSS_PER_PARTY_MEMBER * partySize;
  return particleEnergy * particleCount * share * energyRecharge;
};
