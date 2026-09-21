import { VoiceRequestType } from "#src/models/VoiceRequestType";
import { getSpeechRequest } from "#src/services/getSpeechRequest";
import { readVoiceLanguage } from "#src/services/readVoiceLanguage";
import { registerQuietExit } from "#src/services/registerQuietExit";
import { sendVoiceRequest } from "#src/services/sendVoiceRequest";

// Spawned detached by the session-start hook, which must not wait on it: the synthesizer is woken and this
// Session's character's reference fetched and encoded while the person reads the card, so the first reply is warm
registerQuietExit();
const [name = ""] = process.argv.slice(2);
const language = readVoiceLanguage();
if (name && language) {
  const request = await getSpeechRequest(VoiceRequestType.Warm, name, language, "");
  await sendVoiceRequest(request);
}
