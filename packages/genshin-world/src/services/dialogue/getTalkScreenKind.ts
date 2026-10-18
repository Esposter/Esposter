import type { Resident } from "#src/models/world/Resident";

import { ScreenKind } from "#src/models/screen/ScreenKind";

// The screen a talk opens when the player begins it: a nation's Reputation keeper's talk opens the Reputation screen in
// Place of the talk, and every other talk is the dialogue. A keeper not yet placed in the world has no resident to match, so
// Her talk stays the dialogue and no Reputation screen opens from the world
export const getTalkScreenKind = (
  talkId: string,
  residents: readonly Resident[],
): ScreenKind.Dialogue | ScreenKind.Reputation =>
  residents.some((resident) => resident.keepsReputation && resident.talkId === talkId)
    ? ScreenKind.Reputation
    : ScreenKind.Dialogue;
