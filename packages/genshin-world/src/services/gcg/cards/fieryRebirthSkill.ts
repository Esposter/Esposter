import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { fieryRebirth } from "#src/services/gcg/cards/fieryRebirth";
import { FIERY_REBIRTH_ID } from "#src/services/gcg/cards/constants";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

// Fiery Rebirth, Abyss Lector's passive: when the battle begins, the character gains the Fiery Rebirth state
export const fieryRebirthSkill: GcgSkillModule = {
  getStartingStatuses: () => [createGcgZoneCard(FIERY_REBIRTH_ID, fieryRebirth)],
};
