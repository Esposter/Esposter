import { formatNameplate } from "#src/services/formatNameplate";
import { parseHookInput } from "#src/services/parseHookInput";
import { readPickRecords } from "#src/services/readPickRecords";
import { readPin } from "#src/services/readPin";
import { readStdin } from "#src/services/readStdin";
import { registerFailureFallback } from "#src/services/registerFailureFallback";

// The status line redraws often, so this reads the two state files and never the game data: the session's own
// Record, else the pin. The tool also runs it once at session start, beside the hook that is still recording, so a
// Fresh session's own record may not exist yet — the latest pick of the day stands in until it does, which is the
// Right name under the birthday pick and the last one seen under the lore pick
registerFailureFallback(() => {});
const today = Temporal.Now.plainDateISO();
const input = await readStdin();
const { session_id: sessionId = "" } = parseHookInput(input);
const pickRecords = readPickRecords();
const nameplate =
  pickRecords.find((record) => record.sessionId === sessionId) ??
  readPin() ??
  pickRecords.findLast((record) => record.isoDate === today.toString());
if (nameplate) console.log(formatNameplate(nameplate));
