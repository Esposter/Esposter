import { checkIsMuted } from "#src/services/checkIsMuted";
import {
  DEFAULT_SPEECH_VOICE,
  SPEECH_ENDPOINT_ENVIRONMENT_VARIABLE,
  SPEECH_KEY_ENVIRONMENT_VARIABLE,
  SPEECH_VOICE_ENVIRONMENT_VARIABLE,
} from "#src/services/constants";
import { getFirstSentence } from "#src/services/getFirstSentence";
import { parseHookInput } from "#src/services/parseHookInput";
import { parseVoiceCard } from "#src/services/parseVoiceCard";
import { playAudio } from "#src/services/playAudio";
import { readSessionCharacterName } from "#src/services/readSessionCharacterName";
import { readStdin } from "#src/services/readStdin";
import { readVoiceCard } from "#src/services/readVoiceCard";
import { readVolume } from "#src/services/readVolume";
import { registerFailureFallback } from "#src/services/registerFailureFallback";
import { synthesizeSpeech } from "#src/services/synthesizeSpeech";

// A reply that cannot be spoken is a reply that is not spoken: nothing to print, nothing to block
registerFailureFallback(() => {});
const endpoint = process.env[SPEECH_ENDPOINT_ENVIRONMENT_VARIABLE] ?? "";
const key = process.env[SPEECH_KEY_ENVIRONMENT_VARIABLE] ?? "";
if (endpoint && key && !checkIsMuted()) {
  const input = await readStdin();
  const { last_assistant_message: reply = "", session_id: sessionId = "" } = parseHookInput(input);
  const text = getFirstSentence(reply);
  if (text) {
    // The character's own voice when their card names one, and the configured voice for every character whose card
    // Does not — so setting one is how a person overrides the unwritten cards rather than all of them
    const cardVoice = parseVoiceCard(readVoiceCard(readSessionCharacterName(sessionId))).voice;
    const name = cardVoice.name || process.env[SPEECH_VOICE_ENVIRONMENT_VARIABLE] || DEFAULT_SPEECH_VOICE;
    const audio = await synthesizeSpeech({
      endpoint,
      key,
      text,
      voice: { ...cardVoice, name },
      volume: readVolume(),
    });
    if (audio) playAudio(audio);
  }
}
