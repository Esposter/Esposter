import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { checkIsSilent } from "#src/services/checkIsSilent";
import { deliverVoiceRequest } from "#src/services/deliverVoiceRequest";
import { getSpeechRequest } from "#src/services/getSpeechRequest";
import { getSpokenLines } from "#src/services/getSpokenLines";
import { parseHookInput } from "#src/services/parseHookInput";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { readSessionCharacterName } from "#src/services/readSessionCharacterName";
import { readStdin } from "#src/services/readStdin";
import { readVoiceLanguage } from "#src/services/readVoiceLanguage";
import { registerQuietExit } from "#src/services/registerQuietExit";

// The MessageDisplay hook, run on every flushed piece of a reply and waited on by the display, so it does the least
// A hook can: the gates, which are file reads, the spoken lines in the piece, and the piece handed to the
// Synthesizer — a piece with no line in it too, since the pieces of a reply are numbered and the synthesizer reads
// Them in order however the hooks, which run concurrently, deliver them. Nothing here waits for the engine: a
// Synthesizer that is not running costs a spawn and a node start to its bind, and the load is its own
registerQuietExit();
const language = readVoiceLanguage();
if (language && !checkIsSilent()) {
  const input = await readStdin();
  const {
    delta = "",
    final: isFinal = false,
    index = 0,
    message_id: messageId = "",
    session_id: sessionId = "",
    turn_id: turnId = "",
  } = parseHookInput(input);
  const name = readSessionCharacterName(sessionId);
  if (name) {
    const personaCard = await readPersonaCard(name);
    const lines = getSpokenLines(delta);
    const request = getSpeechRequest(VoiceRequestType.Speak, name, personaCard, language, lines, {
      index,
      isFinal,
      messageId,
      turnId,
    });
    await deliverVoiceRequest(request);
  }
}
