import { getPersonaCharacter } from "#src/services/getPersonaCharacter";
import { getSessionNameplate } from "#src/services/getSessionNameplate";
import { parseHookInput } from "#src/services/parseHookInput";
import { readGenshinDbVersion } from "#src/services/readGenshinDbVersion";
import { readInterfaceLanguage } from "#src/services/readInterfaceLanguage";
import { readPickRecords } from "#src/services/readPickRecords";
import { readPin } from "#src/services/readPin";
import { readRosterCache } from "#src/services/readRosterCache";
import { readStdin } from "#src/services/readStdin";
import { registerQuietExit } from "#src/services/registerQuietExit";

// The session's character for the hooks module, as JSON: run at session start and after every verb, so it reads the
// State files and the roster cache, never the game data. A session that has no cache yet is the first on a machine,
// And its start hook is writing one
registerQuietExit();
const today = Temporal.Now.plainDateISO();
const input = await readStdin();
const { session_id: sessionId = "" } = parseHookInput(input);
const version = readGenshinDbVersion();
const roster = readRosterCache(version, readInterfaceLanguage()) ?? [];
const nameplate = getSessionNameplate(readPickRecords(), readPin(), roster, sessionId, today);
if (nameplate) console.log(JSON.stringify(getPersonaCharacter(nameplate)));
