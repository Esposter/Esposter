import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { STONE_FORCE_ID, STONEHIDE_ID } from "#src/services/gcg/cards/constants";
import { stoneForce } from "#src/services/gcg/cards/stoneForce";
import { stonehide } from "#src/services/gcg/cards/stonehide";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

// Infused Stonehide, Stonehide Lawachurl's passive: when the battle begins, the character gains Stonehide and Stone Force
export const infusedStonehide: GcgSkillModule = {
  getStartingStatuses: () => [
    createGcgZoneCard(STONEHIDE_ID, stonehide),
    createGcgZoneCard(STONE_FORCE_ID, stoneForce),
  ],
};
