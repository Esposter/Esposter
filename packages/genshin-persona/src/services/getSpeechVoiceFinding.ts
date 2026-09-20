import type { SpeechVoice } from "#src/models/SpeechVoice";
import type { SpeechVoiceDefinition } from "#src/models/SpeechVoiceDefinition";

// What is wrong with one card's voice line, against the catalogue the service published, and "" for a line that is
// Fine. Both faults are silent at synthesis time — an unknown voice returns no audio at all, and an unsupported
// Style is dropped back to neutral — so a card is only ever told about them here
export const getSpeechVoiceFinding = (voice: SpeechVoice, definitions: SpeechVoiceDefinition[]): string => {
  const definition = definitions.find((candidate) => candidate.name === voice.name);
  if (!definition) return `names no voice this resource has: ${voice.name}`;
  else if (voice.style && !definition.styles.includes(voice.style))
    return definition.styles.length > 0
      ? `asks for the style "${voice.style}", which ${voice.name} does not declare; it has ${definition.styles.join(", ")}`
      : `asks for the style "${voice.style}", and ${voice.name} declares no styles at all`;

  return "";
};
