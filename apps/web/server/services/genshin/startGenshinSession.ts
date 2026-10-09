import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";

import { EMPTY_GENSHIN_SAVE } from "genshin-world/save";

// Starting the game takes the lease: the session id replaces any older one, and the save it holds carries on, or a new
// Player's save when there is none. The older session is then replaced, and its next write is refused
export const startGenshinSession = (
  envelope: GenshinSaveEnvelope | undefined,
  sessionId: string,
): GenshinSaveEnvelope => ({ save: envelope?.save ?? EMPTY_GENSHIN_SAVE, sessionId });
