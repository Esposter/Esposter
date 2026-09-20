import type { SpeechRequest } from "#src/models/SpeechRequest";

import { escapeXml } from "#src/services/escapeXml";

const VOICE_LOCALE_SEGMENTS = 2;

// The utterance as the service reads it; the volume wraps the text only when one was set, so an unset volume is
// The service's own default rather than a number we chose for it
export const getSsml = ({ text, voice, volume }: Pick<SpeechRequest, "text" | "voice" | "volume">): string => {
  const locale = voice.split("-").slice(0, VOICE_LOCALE_SEGMENTS).join("-");
  const escapedText = escapeXml(text);
  const content = volume ? `<prosody volume="${volume}">${escapedText}</prosody>` : escapedText;
  return `<speak version="1.0" xml:lang="${locale}"><voice name="${voice}">${content}</voice></speak>`;
};
