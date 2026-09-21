import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { checkIsSilent } from "#src/services/checkIsSilent";
import { SEND_SCRIPT_PATH } from "#src/services/constants";
import { getSpeechRequest } from "#src/services/getSpeechRequest";
import { getSpokenLines } from "#src/services/getSpokenLines";
import { parseHookInput } from "#src/services/parseHookInput";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readSessionCharacterName } from "#src/services/readSessionCharacterName";
import { readStdin } from "#src/services/readStdin";
import { readVoiceLanguage } from "#src/services/readVoiceLanguage";
import { registerQuietExit } from "#src/services/registerQuietExit";
import { spawnDetachedScript } from "#src/services/spawnDetachedScript";

// The MessageDisplay hook, run on every flushed piece of a reply and waited on by the display, so it does the least
// A hook can: the gates, which are file reads, the spoken lines in the piece, and one detached process that
// Delivers them — a synthesizer that is not running costs a spawn and a wait inside the load budget, which is not
// The display's time to spend. A piece that cannot be spoken is one that is not spoken: nothing to print, nothing
// To block
registerQuietExit();
const language = readVoiceLanguage();
if (language && !checkIsSilent()) {
  const input = await readStdin();
  const { delta = "", session_id: sessionId = "", turn_id: turnId = "" } = parseHookInput(input);
  const lines = getSpokenLines(delta);
  if (lines.length > 0) {
    const name = readSessionCharacterName(sessionId);
    if (name) {
      const personaCard = await readPersonaCard(name);
      const request = getSpeechRequest(VoiceRequestType.Speak, name, personaCard, language, lines, turnId);
      spawnDetachedScript(SEND_SCRIPT_PATH, JSON.stringify(request));
    }
  }
}
