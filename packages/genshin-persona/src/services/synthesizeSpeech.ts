import type { SpeechRequest } from "#src/models/SpeechRequest";

import { SPEECH_OUTPUT_FORMAT, SPEECH_SYNTHESIS_PATH } from "#src/services/constants";
import { getSsml } from "#src/services/getSsml";

// The audio for one utterance, or nothing once the service declines — which is what the free tier does when the
// Month's allowance binds, and a declined sentence costs nothing
export const synthesizeSpeech = async ({
  endpoint,
  key,
  text,
  voice,
  volume,
}: SpeechRequest): Promise<Uint8Array | undefined> => {
  const response = await fetch(`${endpoint.replace(/\/$/u, "")}${SPEECH_SYNTHESIS_PATH}`, {
    body: getSsml({ text, voice, volume }),
    headers: {
      "Content-Type": "application/ssml+xml",
      "Ocp-Apim-Subscription-Key": key,
      "X-Microsoft-OutputFormat": SPEECH_OUTPUT_FORMAT,
    },
    method: "POST",
  });
  if (!response.ok) return undefined;

  const audioBuffer = await response.arrayBuffer();
  return new Uint8Array(audioBuffer);
};
