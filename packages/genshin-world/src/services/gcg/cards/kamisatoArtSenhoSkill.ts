import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { kamisatoArtSenho, SENHO_STATUS_ID } from "#src/services/gcg/cards/kamisatoArtSenho";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

// Kamisato Art: Senho, held from the battle's start. Its second entry, 11055, repeats its text and is left unregistered, so
// the passive is held once
export const kamisatoArtSenhoSkill: GcgSkillModule = {
  getStartingStatuses: () => [createGcgZoneCard(SENHO_STATUS_ID, kamisatoArtSenho)],
};
