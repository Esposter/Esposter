import type { SpeechRequest } from "#src/models/SpeechRequest";

import { MICROSOFT_SPEECH_NAMESPACE } from "#src/services/constants";
import { escapeXml } from "#src/services/escapeXml";

const VOICE_LOCALE_SEGMENTS = 2;

// The markup reads an adjustment as a percentage relative to the voice's own, and a rise has to carry its sign
const formatPercentage = (value: number) => `${value > 0 ? "+" : ""}${value}%`;

// The utterance as the service reads it, wrapped from the inside out: the prosody carries only the adjustments that
// Were set, so an unset one is the voice's own rather than a number we chose for it, and the style element is there
// Only when a card named a style, since it is the one part that needs a namespace on the root
export const getSsml = ({ text, voice, volume }: Pick<SpeechRequest, "text" | "voice" | "volume">): string => {
  const locale = voice.name.split("-").slice(0, VOICE_LOCALE_SEGMENTS).join("-");
  const prosodyAttributes = [
    voice.pitch ? `pitch="${formatPercentage(voice.pitch)}"` : "",
    voice.rate ? `rate="${formatPercentage(voice.rate)}"` : "",
    volume ? `volume="${volume}"` : "",
  ].filter(Boolean);
  const escapedText = escapeXml(text);
  const spokenText =
    prosodyAttributes.length > 0 ? `<prosody ${prosodyAttributes.join(" ")}>${escapedText}</prosody>` : escapedText;
  const styleDegree = voice.styleDegree ? ` styledegree="${voice.styleDegree}"` : "";
  const content = voice.style
    ? `<mstts:express-as style="${voice.style}"${styleDegree}>${spokenText}</mstts:express-as>`
    : spokenText;
  const namespace = voice.style ? ` xmlns:mstts="${MICROSOFT_SPEECH_NAMESPACE}"` : "";
  return `<speak version="1.0"${namespace} xml:lang="${locale}"><voice name="${voice.name}">${content}</voice></speak>`;
};
