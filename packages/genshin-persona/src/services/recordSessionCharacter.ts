import type { Nameplate } from "#src/models/Nameplate";

import { pruneStalePickRecords } from "#src/services/pruneStalePickRecords";
import { readPickRecords } from "#src/services/readPickRecords";
import { writePickRecords } from "#src/services/writePickRecords";

// The session's record is what every later reader trusts — the start hook on a compact or resume, the status
// Line, the speech hook — so whoever changes a session's character writes it here, and so does whoever changes the
// Language the status line draws that character's name in
export const recordSessionCharacter = (
  { displayName, element, name }: Nameplate,
  sessionId: string,
  todayIsoDate: string,
): void => {
  const pickRecords = pruneStalePickRecords(readPickRecords(), todayIsoDate);
  const otherRecords = pickRecords.filter((record) => record.sessionId !== sessionId);
  writePickRecords([...otherRecords, { displayName, element, isoDate: todayIsoDate, name, sessionId }]);
};
