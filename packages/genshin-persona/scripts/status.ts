import { formatNameplate } from "#src/services/formatNameplate";
import { getSessionNameplate } from "#src/services/getSessionNameplate";
import { parseHookInput } from "#src/services/parseHookInput";
import { readGenshinDbVersion } from "#src/services/readGenshinDbVersion";
import { readPickRecords } from "#src/services/readPickRecords";
import { readPin } from "#src/services/readPin";
import { readRosterCache } from "#src/services/readRosterCache";
import { readStdin } from "#src/services/readStdin";
import { registerFailureFallback } from "#src/services/registerFailureFallback";

// The status line redraws often, so this reads the state files and the roster cache, never the game data: a
// Session that has no cache yet is the first on a machine, and its start hook is writing one
registerFailureFallback(() => {});
const today = Temporal.Now.plainDateISO();
const input = await readStdin();
const { session_id: sessionId = "" } = parseHookInput(input);
const version = readGenshinDbVersion();
const roster = readRosterCache(version) ?? [];
const nameplate = getSessionNameplate(readPickRecords(), readPin(), roster, sessionId, today);
if (nameplate) console.log(formatNameplate(nameplate));
