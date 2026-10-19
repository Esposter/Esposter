import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { ELEMENTAL_LIFEFORM_ELECTRO_ID } from "#src/services/gcg/cards/constants";
import { elementalLifeformElectro } from "#src/services/gcg/cards/elementalLifeformElectro";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

// Elemental Sedimentation: Electro, Electro Slime's passive: when the battle begins, the character gains the Elemental
// Lifeform status
export const elementalSedimentation: GcgSkillModule = {
  getStartingStatuses: () => [createGcgZoneCard(ELEMENTAL_LIFEFORM_ELECTRO_ID, elementalLifeformElectro)],
};
