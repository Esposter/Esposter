import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";

import { EMPTY_GENSHIN_SAVE } from "genshin-world/save";

// Starting the game takes the lease: the session id replaces any older one, and the save it holds carries on, or a new
// Player's save when there is none. The session it replaces is kept on the envelope and its next write is refused, so a
// Retry of this start answers the same replacement
export const startGenshinSession = (
  envelope: GenshinSaveEnvelope | undefined,
  sessionId: string,
): GenshinSaveEnvelope => ({
  save: envelope?.save ?? EMPTY_GENSHIN_SAVE,
  sessionId,
  ...(envelope ? { previousSessionId: envelope.sessionId } : {}),
});
