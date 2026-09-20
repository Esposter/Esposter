import type { VoiceFit } from "#src/models/voiceMatch/VoiceFit";

// One character's generated voice module, in the shape of their card: the entry carries only what was measured — an
// Adjustment of nothing is an adjustment the module does not make, and a style is the ear's to add in the card
// Against the voice named here. The name is the catalogue's own spelling written into a source file, so it is quoted
// As the literal it becomes rather than interpolated between quotes a name carrying one of its own would close
export const getPersonaVoiceSource = (personaCardName: string, { pitch, rate, voice }: VoiceFit): string => {
  const fields = [`name: ${JSON.stringify(voice)}`, pitch ? `pitch: ${pitch}` : "", rate ? `rate: ${rate}` : ""].filter(
    Boolean,
  );
  return `import type { SpeechVoice } from "#src/models/SpeechVoice";

const ${personaCardName}: SpeechVoice = { ${fields.join(", ")} };

export default ${personaCardName};
`;
};
