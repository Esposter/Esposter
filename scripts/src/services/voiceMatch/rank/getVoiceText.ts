import type { VoiceFit } from "#src/models/voiceMatch/VoiceFit";

// The card's voice object as the formatter writes it, carrying only what was measured: an adjustment of nothing is
// An adjustment the card does not make, and a style is the ear's to add against the voice it now names. The name is
// The catalogue's own spelling written into a source file, so it is quoted as the literal it becomes rather than
// Interpolated between quotes a name carrying one of its own would close
export const getVoiceText = ({ pitch, rate, voice }: VoiceFit): string => {
  const fields = [`name: ${JSON.stringify(voice)}`, pitch ? `pitch: ${pitch}` : "", rate ? `rate: ${rate}` : ""].filter(
    Boolean,
  );
  return `{ ${fields.join(", ")} }`;
};
