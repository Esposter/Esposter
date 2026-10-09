import type { Element } from "#src/models/Element";

import { Elements } from "#src/models/Element";
import { PARTY_RESONANCE_MEMBER_COUNT, PARTY_TEAM_SIZE } from "#src/services/party/constants";

// The elemental resonances a deployed team gives, from its members' elements: each element at least two members of a
// Full team share, in the game's element order. A team not full gives none
export const getElementalResonances = (elements: Element[]): Element[] => {
  if (elements.length !== PARTY_TEAM_SIZE) return [];
  return Elements.filter((element) => {
    const memberCount = elements.filter((memberElement) => memberElement === element).length;
    return memberCount >= PARTY_RESONANCE_MEMBER_COUNT;
  });
};
