import type { Party } from "#src/models/party/Party";

import { markRaw, reactive } from "vue";

// The party as the world holds it: reactive, so the screen redraws its members and teams as they change, with the state
// Only the step reads held raw, its health changes not yet sent, Lunar-Charged cloud, Lunar-Crystallize, Verdant Dew and each member's elemental state,
// So the step's writes to them each step cost no reactive write. Nothing replaces them, so each stays raw
export const createWorldParty = (party: Party): Party => {
  markRaw(party.healthChanges);
  markRaw(party.lunarChargedCloud);
  markRaw(party.lunarCrystallize);
  markRaw(party.verdantDew);
  for (const { elementalState } of party.characterIdMemberMap.values()) markRaw(elementalState);
  return reactive(party);
};
