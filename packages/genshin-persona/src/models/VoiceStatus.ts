// The first word of the one line the resident synthesizer answers a request with. A frozen object rather than an
// `enum`: node runs these scripts by stripping types
export const VoiceStatus = {
  Error: "error",
  Ok: "ok",
  // Replaced by a newer request before it ran
  Superseded: "superseded",
} as const;

export type VoiceStatus = (typeof VoiceStatus)[keyof typeof VoiceStatus];
