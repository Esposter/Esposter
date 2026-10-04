import type { PersonaStatus } from "#types";

import { getPersonaCharacter } from "#src/services/getPersonaCharacter";
import { parseHookInput } from "#src/services/parseHookInput";
import { readSessionNameplate } from "#src/services/readSessionNameplate";
import { readStdin } from "#src/services/readStdin";
import { registerQuietExit } from "#src/services/registerQuietExit";

// The session's character for the hooks module, as JSON: run at session start, after every verb and after each turn
// Until the session's own record exists
registerQuietExit();
const input = await readStdin();
const { session_id: sessionId = "" } = parseHookInput(input);
const sessionNameplate = readSessionNameplate(sessionId);
if (sessionNameplate) {
  const { isRecorded, nameplate } = sessionNameplate;
  console.log(JSON.stringify({ character: getPersonaCharacter(nameplate), isRecorded } satisfies PersonaStatus));
}
