import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { elementalLifeformElectro } from "#src/services/gcg/cards/elementalLifeformElectro";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

const ELEMENTAL_LIFEFORM_ELECTRO_ID = 134_061;

// Elemental Sedimentation: Electro, Electro Slime's passive: when the battle begins, the character gains the Elemental
// Lifeform status
export const elementalSedimentation: GcgSkillModule = {
  getStartingStatus: () => createGcgZoneCard(ELEMENTAL_LIFEFORM_ELECTRO_ID, elementalLifeformElectro),
};
