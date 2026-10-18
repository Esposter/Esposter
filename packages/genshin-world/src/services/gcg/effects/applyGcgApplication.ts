import type { Element } from "#src/models/Element";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";

import { GcgAura } from "#src/models/gcg/GcgAura";
import { GCG_AURA_ELEMENTS } from "#src/services/gcg/constants";

// An element applied to a character with no damage: the character takes it as its aura when it holds none and the element
// Is one an aura takes. A character already holding an aura keeps it, since the reaction an application makes is not modelled
export const applyGcgApplication = (character: GcgCharacterState, element: Element): void => {
  if (character.aura === GcgAura.None && GCG_AURA_ELEMENTS.includes(element)) character.aura = element;
};
