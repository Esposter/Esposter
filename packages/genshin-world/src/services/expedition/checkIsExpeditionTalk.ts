import type { Resident } from "#src/models/world/Resident";

import { KATHERYNE_NPC_ID } from "#src/services/expedition/constants";

// Whether a talk is Katheryne's, whose talk opens the expedition screen in place of the talk. She is a resident once her
// Place is in the region data, so her talk is one only while a resident holding it stands in the world
export const checkIsExpeditionTalk = (talkId: string, residents: readonly Resident[]): boolean =>
  residents.some((resident) => resident.id === KATHERYNE_NPC_ID && resident.talkId === talkId);
