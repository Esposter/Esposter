import { readPickRecords } from "#src/services/readPickRecords";
import { readPin } from "#src/services/readPin";

// Who this session is speaking as, read back from what the session start already decided rather than decided
// Again: this runs after every reply, and a fresh pick can reach the network. A session with no record yet — one
// Started before the plugin, or whose start hook failed — has the pin's name, else none, and the configured voice
// Reads for it
export const readSessionCharacterName = (sessionId: string): string => {
  const sessionRecord = readPickRecords().find((record) => record.sessionId === sessionId);
  return sessionRecord?.name ?? readPin()?.name ?? "";
};
