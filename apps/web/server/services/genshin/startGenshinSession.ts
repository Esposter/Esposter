import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";
import type { GenshinSave } from "genshin-world/save";

// Starting the game takes the lease: the session id replaces any older one.
// The save it holds carries on, or else the save a new player starts with.
// The session it replaces is kept on the envelope, and its next write is refused.
// So a retry of this start answers the same replacement.
export const startGenshinSession = (
  envelope: GenshinSaveEnvelope | undefined,
  sessionId: string,
  save: GenshinSave,
): GenshinSaveEnvelope => ({ save, sessionId, ...(envelope ? { previousSessionId: envelope.sessionId } : {}) });
