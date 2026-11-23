import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";
import type { GenshinSave } from "genshin-world/save";

// Starting the game takes the lease: the session id replaces any older one, and the save it holds carries on, or the save
// A new player starts with. The session it replaces is kept on the envelope and its next write is refused, so a retry of
// This start answers the same replacement
export const startGenshinSession = (
  envelope: GenshinSaveEnvelope | undefined,
  sessionId: string,
  save: GenshinSave,
): GenshinSaveEnvelope => ({ save, sessionId, ...(envelope ? { previousSessionId: envelope.sessionId } : {}) });
