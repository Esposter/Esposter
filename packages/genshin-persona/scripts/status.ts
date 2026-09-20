import { NAMEPLATE_PREFIX } from "#src/services/constants";
import { parseHookInput } from "#src/services/parseHookInput";
import { readPickRecords } from "#src/services/readPickRecords";
import { readPin } from "#src/services/readPin";
import { readStdin } from "#src/services/readStdin";
import { registerFailureFallback } from "#src/services/registerFailureFallback";

// The status line redraws often, so this reads the two state files and never the game data: the name the
// Session-start hook recorded is the whole answer
registerFailureFallback(() => {});
const input = await readStdin();
const { session_id: sessionId = "" } = parseHookInput(input);
const pin = readPin();
const sessionRecord = readPickRecords().find((record) => record.sessionId === sessionId);
const name = pin || sessionRecord?.name || "";
if (name) console.log(`${NAMEPLATE_PREFIX}${name}`);
