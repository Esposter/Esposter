import { formatNameplate } from "#src/services/formatNameplate";
import { getToday } from "#src/services/getToday";
import { parseHookInput } from "#src/services/parseHookInput";
import { readDayPick } from "#src/services/readDayPick";
import { readPickRecords } from "#src/services/readPickRecords";
import { readPin } from "#src/services/readPin";
import { readStdin } from "#src/services/readStdin";
import { registerFailureFallback } from "#src/services/registerFailureFallback";

// The status line redraws often, so this reads the state files and never the game data: the pin, else the name
// The session-start hook recorded. The tool also runs it once at session start, beside the hook that is still
// Recording, so a fresh session's own record may not exist yet — the day's pick, which every session that day
// Shares, stands in until it does
registerFailureFallback(() => {});
const today = getToday();
const input = await readStdin();
const { session_id: sessionId = "" } = parseHookInput(input);
const dayPick = readDayPick();
const nameplate =
  readPin() ??
  readPickRecords().find((record) => record.sessionId === sessionId) ??
  (dayPick?.isoDate === today.isoDate ? dayPick : undefined);
if (nameplate) console.log(formatNameplate(nameplate));
