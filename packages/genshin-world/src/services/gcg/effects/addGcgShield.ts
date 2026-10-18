import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";

import { GCG_SHIELD_LIMIT } from "#src/services/gcg/constants";

// Gives a character shield points, up to the shield limit
export const addGcgShield = (character: GcgCharacterState, points: number): void => {
  character.shield = Math.min(GCG_SHIELD_LIMIT, character.shield + points);
};
