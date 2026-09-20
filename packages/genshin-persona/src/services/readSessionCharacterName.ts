import { readPickRecords } from "#src/services/readPickRecords";
import { readPin } from "#src/services/readPin";

// Who this session is speaking as, read back from what the session start already decided rather than decided again:
// This runs after every reply, and a fresh pick can reach the network. A session with no record yet — one started
// Before the plugin, or whose start hook failed — has no name, and the configured voice reads for it
export const readSessionCharacterName = (sessionId: string): string => {
  const pin = readPin();
  if (pin) return pin.name;

  const sessionRecord = readPickRecords().find((record) => record.sessionId === sessionId);
  return sessionRecord?.name ?? "";
};
