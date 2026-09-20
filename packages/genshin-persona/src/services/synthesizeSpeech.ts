import type { SpeechRequest } from "#src/models/SpeechRequest";

import { SPEECH_OUTPUT_FORMAT, SPEECH_SYNTHESIS_PATH, SPEECH_TIMEOUT_MS } from "#src/services/constants";
import { getSpeechUrl } from "#src/services/getSpeechUrl";
import { getSsml } from "#src/services/getSsml";

// The audio for one utterance, or nothing once the service declines — which is what the free tier does when the
// Month's allowance binds, and a declined sentence costs nothing. A service that answers neither way is the same
// Sentence unspoken, so the request carries its own ceiling rather than holding the hook open
export const synthesizeSpeech = async ({
  endpoint,
  key,
  text,
  voice,
  volume,
}: SpeechRequest): Promise<Uint8Array | undefined> => {
  const response = await fetch(getSpeechUrl(endpoint, SPEECH_SYNTHESIS_PATH), {
    body: getSsml({ text, voice, volume }),
    headers: {
      "Content-Type": "application/ssml+xml",
      "Ocp-Apim-Subscription-Key": key,
      "X-Microsoft-OutputFormat": SPEECH_OUTPUT_FORMAT,
    },
    method: "POST",
    signal: AbortSignal.timeout(SPEECH_TIMEOUT_MS),
  });
  if (!response.ok) return undefined;

  const audioBuffer = await response.arrayBuffer();
  return new Uint8Array(audioBuffer);
};
