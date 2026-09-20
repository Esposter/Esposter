import { checkIsMuted } from "#src/services/checkIsMuted";
import {
  DEFAULT_SPEECH_VOICE,
  SPEECH_ENDPOINT_ENVIRONMENT_VARIABLE,
  SPEECH_KEY_ENVIRONMENT_VARIABLE,
  SPEECH_VOICE_ENVIRONMENT_VARIABLE,
} from "#src/services/constants";
import { getFirstSentence } from "#src/services/getFirstSentence";
import { parseHookInput } from "#src/services/parseHookInput";
import { playAudio } from "#src/services/playAudio";
import { readStdin } from "#src/services/readStdin";
import { readVolume } from "#src/services/readVolume";
import { registerFailureFallback } from "#src/services/registerFailureFallback";
import { synthesizeSpeech } from "#src/services/synthesizeSpeech";

// A reply that cannot be spoken is a reply that is not spoken: nothing to print, nothing to block
registerFailureFallback(() => {});
const endpoint = process.env[SPEECH_ENDPOINT_ENVIRONMENT_VARIABLE] ?? "";
const key = process.env[SPEECH_KEY_ENVIRONMENT_VARIABLE] ?? "";
const voice = process.env[SPEECH_VOICE_ENVIRONMENT_VARIABLE] || DEFAULT_SPEECH_VOICE;
if (endpoint && key && !checkIsMuted()) {
  const input = await readStdin();
  const { last_assistant_message: reply = "" } = parseHookInput(input);
  const text = getFirstSentence(reply);
  if (text) {
    const audio = await synthesizeSpeech({ endpoint, key, text, voice, volume: readVolume() });
    if (audio) playAudio(audio);
  }
}
