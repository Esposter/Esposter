import type { Kit } from "#src/models/kit/Kit";

import { DILUC_CHARACTER_ID } from "#src/services/character/constants";
import { DILUC_KIT } from "#src/services/kit/characters/dilucKit";

// Each character's kit by its avatar id, for those whose module is built. A character with none falls back to the
// Traveler's kit, as the roster does
export const CharacterIdKitMap: Partial<Record<number, Kit>> = { [DILUC_CHARACTER_ID]: DILUC_KIT };
