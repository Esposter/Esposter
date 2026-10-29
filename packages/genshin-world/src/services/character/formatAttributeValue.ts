import type { Attribute } from "#src/models/character/Attribute";

import { WHOLE_ATTRIBUTES } from "#src/services/character/constants";

// An attribute's total as the game writes it: whole for the bases, the flats and Elemental Mastery, and a percentage to
// One place for the rest
export const formatAttributeValue = (attribute: Attribute, total: number): string =>
  WHOLE_ATTRIBUTES.includes(attribute) ? `${Math.round(total)}` : `${(total * 100).toFixed(1)}%`;
