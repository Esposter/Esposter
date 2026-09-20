// The keys a card's voice line may set after the voice name, spelled as the speech markup spells its attributes
// So there is one name to remember rather than two
export const SpeechVoiceField = {
  Pitch: "pitch",
  Rate: "rate",
  Style: "style",
  StyleDegree: "styledegree",
} as const;

export type SpeechVoiceField = (typeof SpeechVoiceField)[keyof typeof SpeechVoiceField];
