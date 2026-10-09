import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { flowfireEdge } from "#src/services/gcg/cards/flowfireEdge";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";

const FLOWFIRE_EDGE_ID = 133_021;

// Flowfire Edge, Blazing Axe Mitachurl's passive: when the battle begins, the character gains the Flowfire Edge status
export const flowfireEdgeSkill: GcgSkillModule = {
  getStartingStatus: () => createGcgZoneCard(FLOWFIRE_EDGE_ID, flowfireEdge),
};
