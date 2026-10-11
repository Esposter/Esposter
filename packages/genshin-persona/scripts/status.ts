import type { PersonaStatus } from "#types";

import { getPersonaCharacter } from "#src/services/getPersonaCharacter";
import { readSessionNameplate } from "#src/services/readSessionNameplate";
import { readStdinSessionId } from "#src/services/readStdinSessionId";
import { registerQuietExit } from "#src/services/registerQuietExit";

// The session's character for the hooks module, as JSON: run at session start, after every verb and after each turn
// Until the session's own record exists
registerQuietExit();
const sessionId = await readStdinSessionId();
const sessionNameplate = readSessionNameplate(sessionId);
if (sessionNameplate) {
  const { isRecorded, nameplate } = sessionNameplate;
  console.log(JSON.stringify({ character: getPersonaCharacter(nameplate), isRecorded } satisfies PersonaStatus));
}
