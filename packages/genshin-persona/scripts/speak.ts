import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { checkIsSilent } from "#src/services/checkIsSilent";
import { getSpeechRequest } from "#src/services/getSpeechRequest";
import { getSpokenProse } from "#src/services/getSpokenProse";
import { parseHookInput } from "#src/services/parseHookInput";
import { readSessionCharacterName } from "#src/services/readSessionCharacterName";
import { readStdin } from "#src/services/readStdin";
import { readVoiceLanguage } from "#src/services/readVoiceLanguage";
import { registerQuietExit } from "#src/services/registerQuietExit";
import { sendVoiceRequest } from "#src/services/sendVoiceRequest";

// A reply that cannot be spoken is a reply that is not spoken: nothing to print, nothing to block. The gate is the
// Voice language the `voice` verb wrote, since a machine without one has no engine to speak with, then whether
// The reply would be heard at all, since every cost of one is paid before the volume is ever applied
registerQuietExit();
const language = readVoiceLanguage();
if (language && !checkIsSilent()) {
  const input = await readStdin();
  const { last_assistant_message: reply = "", session_id: sessionId = "" } = parseHookInput(input);
  const text = getSpokenProse(reply);
  const name = readSessionCharacterName(sessionId);
  if (text && name) {
    const request = await getSpeechRequest(VoiceRequestType.Speak, name, language, text);
    await sendVoiceRequest(request);
  }
}
