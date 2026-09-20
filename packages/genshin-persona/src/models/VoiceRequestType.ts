// What a hook asks the resident synthesizer for. A frozen object rather than an `enum`: node runs these scripts by
// Stripping types
export const VoiceRequestType = {
  // Synthesize the text and play it
  Speak: "speak",
  // Exit, so a teardown can delete the weights the process holds open
  Stop: "stop",
  // Fetch and encode the character's reference and run one short synthesis, so the first reply is warm
  Warm: "warm",
} as const;

export type VoiceRequestType = (typeof VoiceRequestType)[keyof typeof VoiceRequestType];
