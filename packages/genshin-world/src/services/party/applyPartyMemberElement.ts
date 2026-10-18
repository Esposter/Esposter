import type { Reaction } from "#src/models/combat/Reaction";
import type { Element } from "#src/models/Element";
import type { ElementalResonance } from "#src/models/party/ElementalResonance";
import type { Party } from "#src/models/party/Party";

import { applyElement } from "#src/services/combat/aura/applyElement";
import { AfflictionResonanceElementMap } from "#src/services/party/AfflictionResonanceElementMap";
import { RESONANCE_AFFLICTION_TIME_SHARE } from "#src/services/party/constants";
import { getPartyMember } from "#src/services/party/getPartyMember";

// An element put on a party member, written into its elemental state as an enemy's is. A Resonance of the team that
// Shortens this element's afflictions makes the affliction last its share of the time, as the Team Bonus page gives it
export const applyPartyMemberElement = (
  party: Party,
  characterId: number,
  element: Element,
  gauge: number,
  elementalResonances: readonly ElementalResonance[],
): Reaction[] => {
  const shorteningResonance = AfflictionResonanceElementMap[element];
  const isShortened = shorteningResonance !== undefined && elementalResonances.includes(shorteningResonance);
  return applyElement(getPartyMember(party, characterId).elementalState, element, gauge, {
    auraDecayRateScale: isShortened ? 1 / RESONANCE_AFFLICTION_TIME_SHARE : 1,
  });
};
