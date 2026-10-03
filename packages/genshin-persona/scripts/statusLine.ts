import { formatNameplate } from "#src/services/formatNameplate";
import { parseHookInput } from "#src/services/parseHookInput";
import { readSessionNameplate } from "#src/services/readSessionNameplate";
import { readStdin } from "#src/services/readStdin";
import { registerQuietExit } from "#src/services/registerQuietExit";

// A status line command a person names in their own settings, since no plugin can set one: the session's nameplate.
// Claude Code hands it the session's id on stdin as it does a hook
registerQuietExit();
const input = await readStdin();
const { session_id: sessionId = "" } = parseHookInput(input);
const sessionNameplate = readSessionNameplate(sessionId);
if (sessionNameplate) console.log(formatNameplate(sessionNameplate.nameplate));
