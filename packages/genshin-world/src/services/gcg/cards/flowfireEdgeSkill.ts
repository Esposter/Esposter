import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { FLOWFIRE_EDGE_ID } from "#src/services/gcg/cards/constants";
import { flowfireEdge } from "#src/services/gcg/cards/flowfireEdge";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

// Flowfire Edge, Blazing Axe Mitachurl's passive: when the battle begins, the character gains the Flowfire Edge status
export const flowfireEdgeSkill: GcgSkillModule = {
  getStartingStatuses: () => [createGcgZoneCard(FLOWFIRE_EDGE_ID, flowfireEdge)],
};
