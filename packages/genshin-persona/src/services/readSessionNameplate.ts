import type { Nameplate } from "#src/models/Nameplate";

import { getSessionNameplate } from "#src/services/getSessionNameplate";
import { readGenshinDbVersion } from "#src/services/readGenshinDbVersion";
import { readInterfaceLanguage } from "#src/services/readInterfaceLanguage";
import { readPickRecords } from "#src/services/readPickRecords";
import { readPin } from "#src/services/readPin";
import { readRosterCache } from "#src/services/readRosterCache";

// The session's character off the state files and the roster cache, never the game data, which costs the better part
// Of a second to load: the session's record, else the pin, else the birthday pick standing in while the start hook is
// Still recording, and whether it was the session's own record. A session that has no cache yet is the first on a
// Machine, and its start hook is writing one
export const readSessionNameplate = (sessionId: string): undefined | { isRecorded: boolean; nameplate: Nameplate } => {
  const today = Temporal.Now.plainDateISO();
  const version = readGenshinDbVersion();
  const roster = readRosterCache(version, readInterfaceLanguage()) ?? [];
  const pickRecords = readPickRecords();
  const nameplate = getSessionNameplate(pickRecords, readPin(), roster, sessionId, today);
  if (!nameplate) return undefined;

  const isRecorded = pickRecords.some((record) => record.sessionId === sessionId);
  return { isRecorded, nameplate };
};
