import type { Attribute } from "#src/models/character/Attribute";

import { WHOLE_ATTRIBUTES } from "#src/services/character/constants";
import { formatWholeNumber } from "#src/services/character/formatWholeNumber";

// An attribute's total as the game writes it: whole, grouped as the game groups it, for the bases, the flats and Elemental
// Mastery, and a percentage to one place for the rest
export const formatAttributeValue = (attribute: Attribute, total: number): string =>
  WHOLE_ATTRIBUTES.includes(attribute) ? formatWholeNumber(total) : `${(total * 100).toFixed(1)}%`;
