import type { Party } from "#src/models/party/Party";

import { createParty } from "#src/services/party/createParty";
import { markRaw, reactive } from "vue";

// The party as the world holds it: reactive, so the screen redraws its members and teams as they change, with the state
// Only the step reads held raw, its health changes not yet sent, Lunar-Charged cloud, Lunar-Crystallize and Verdant Dew,
// So the step's writes to them each step cost no reactive write. Nothing replaces them, so each stays raw
export const createWorldParty = (characterIds: number[]): Party => {
  const party = createParty(characterIds);
  markRaw(party.healthChanges);
  markRaw(party.lunarChargedCloud);
  markRaw(party.lunarCrystallize);
  markRaw(party.verdantDew);
  return reactive(party);
};
