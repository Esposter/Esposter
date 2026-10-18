import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { electroCrystalCore } from "#src/services/gcg/cards/electroCrystalCore";
import { ELECTRO_CRYSTAL_CORE_ID } from "#src/services/gcg/cards/constants";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

// Electro Crystal Core, Electro Hypostasis' passive: when the battle begins, the character gains the Electro Crystal Core state
export const electroCrystalCoreSkill: GcgSkillModule = {
  getStartingStatuses: () => [createGcgZoneCard(ELECTRO_CRYSTAL_CORE_ID, electroCrystalCore)],
};
