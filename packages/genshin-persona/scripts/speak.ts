import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { checkIsMuted } from "#src/services/checkIsMuted";
import { getFirstSentence } from "#src/services/getFirstSentence";
import { getSpeechRequest } from "#src/services/getSpeechRequest";
import { parseHookInput } from "#src/services/parseHookInput";
import { readLanguage } from "#src/services/readLanguage";
import { readSessionCharacterName } from "#src/services/readSessionCharacterName";
import { readStdin } from "#src/services/readStdin";
import { registerQuietExit } from "#src/services/registerQuietExit";
import { sendVoiceRequest } from "#src/services/sendVoiceRequest";

// A reply that cannot be spoken is a reply that is not spoken: nothing to print, nothing to block. The gate is the
// Dub the `voice` verb wrote, since a machine without one has no engine to speak with, then the mute flag
registerQuietExit();
const language = readLanguage();
if (language && !checkIsMuted()) {
  const input = await readStdin();
  const { last_assistant_message: reply = "", session_id: sessionId = "" } = parseHookInput(input);
  const text = getFirstSentence(reply);
  const name = readSessionCharacterName(sessionId);
  if (text && name) {
    const request = await getSpeechRequest(VoiceRequestType.Speak, name, language, text);
    await sendVoiceRequest(request);
  }
}
