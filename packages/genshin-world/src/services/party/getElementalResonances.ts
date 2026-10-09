import type { Element } from "#src/models/Element";
import type { ElementalResonance } from "#src/models/party/ElementalResonance";

import { Elements } from "#src/models/Element";
import { SpecialResonance } from "#src/models/party/SpecialResonance";
import { PARTY_RESONANCE_MEMBER_COUNT, PARTY_TEAM_SIZE } from "#src/services/party/constants";

// The elemental resonances a deployed team gives, from its members' elements: each element at least two members of a
// Full team share, in the game's element order, or the Protective Canopy when its four members are four unique
// Elements. A team not full gives none
export const getElementalResonances = (elements: Element[]): ElementalResonance[] => {
  if (elements.length !== PARTY_TEAM_SIZE) return [];
  if (new Set(elements).size === PARTY_TEAM_SIZE) return [SpecialResonance.ProtectiveCanopy];
  return Elements.filter((element) => {
    const memberCount = elements.filter((memberElement) => memberElement === element).length;
    return memberCount >= PARTY_RESONANCE_MEMBER_COUNT;
  });
};
