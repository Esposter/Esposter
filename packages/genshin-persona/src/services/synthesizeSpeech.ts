import type { SpeechRequest } from "#src/models/SpeechRequest";

import { SPEECH_OUTPUT_FORMAT, SPEECH_SYNTHESIS_PATH } from "#src/services/constants";
import { escapeXml } from "#src/services/escapeXml";

const VOICE_LOCALE_SEGMENTS = 2;

// The audio for one utterance, or nothing once the service declines — which is what the free tier does when the
// Month's allowance binds, and a declined sentence costs nothing
export const synthesizeSpeech = async ({
  endpoint,
  key,
  text,
  voice,
}: SpeechRequest): Promise<Uint8Array | undefined> => {
  const locale = voice.split("-").slice(0, VOICE_LOCALE_SEGMENTS).join("-");
  const ssml = `<speak version="1.0" xml:lang="${locale}"><voice name="${voice}">${escapeXml(text)}</voice></speak>`;
  const response = await fetch(`${endpoint.replace(/\/$/u, "")}${SPEECH_SYNTHESIS_PATH}`, {
    body: ssml,
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
