import { formatNameplate } from "#src/services/formatNameplate";
import { readSessionNameplate } from "#src/services/readSessionNameplate";
import { readStdinSessionId } from "#src/services/readStdinSessionId";
import { registerQuietExit } from "#src/services/registerQuietExit";

// A status line command a person names in their own settings, since no plugin can set one: the session's nameplate.
// Claude Code hands it the session's id on stdin as it does a hook
registerQuietExit();
const sessionId = await readStdinSessionId();
const sessionNameplate = readSessionNameplate(sessionId);
if (sessionNameplate) console.log(formatNameplate(sessionNameplate.nameplate));
