import type { GenshinSaveEnvelope } from "#server/models/genshin/GenshinSaveEnvelope";

// Only the session that started last may write. A save that was never started has no session to match
export const checkIsGenshinSessionCurrent = (envelope: GenshinSaveEnvelope | undefined, sessionId: string): boolean =>
  envelope?.sessionId === sessionId;
