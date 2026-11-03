import type { Party } from "#src/models/party/Party";

import { markRaw, reactive } from "vue";

// The state only the step reads is held raw, so the step's writes to it each step cost no reactive write: the party's
// Health changes not yet sent, Lunar-Charged cloud, Lunar-Crystallize, Verdant Dew and each member's elemental state.
// Each is marked raw again whenever replaceWorldParty swaps in another party's, so none is ever left reactive
const markPartyRaw = (party: Party): Party => {
  markRaw(party.healthChanges);
  markRaw(party.lunarChargedCloud);
  markRaw(party.lunarCrystallize);
  markRaw(party.verdantDew);
  for (const { elementalState } of party.characterIdMemberMap.values()) markRaw(elementalState);
  return party;
};

// The party as the world holds it: reactive, so the screen redraws its members and teams as they change
export const createWorldParty = (party: Party): Party => reactive(markPartyRaw(party));

// A party the world holds, given another party's members and teams in its place. It is changed where it stands and not
// Swapped for a new one, so everything that was handed the party keeps the same one
export const replaceWorldParty = (worldParty: Party, party: Party) => {
  Object.assign(worldParty, markPartyRaw(party));
};
