import type { Character } from "#src/models/Character";
import type { Nameplate } from "#src/models/Nameplate";
import type { PickRecord } from "#src/models/PickRecord";

import { pickCharacter } from "#src/services/pickCharacter";

// Who the hooks module draws: the session's own record, else the pin, else the birthday pick — the same order the
// Start hook resolves in, without the lore pick it cannot wait on. The module reads it at session start, beside the
// Hook that is still recording, so a fresh session's record may not exist yet; the birthday pick is what
// The hook itself gives that session without a key, and is read off no other session's record, so a `use` in one
// Session never stands in for another
export const getSessionNameplate = (
  pickRecords: PickRecord[],
  pin: Nameplate | undefined,
  roster: Character[],
  sessionId: string,
  today: Temporal.PlainDate,
): Nameplate | undefined =>
  pickRecords.find((record) => record.sessionId === sessionId) ?? pin ?? pickCharacter(roster, today);
