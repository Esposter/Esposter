// The first word of the one line the resident synthesizer answers a request with
export const VoiceStatus = {
  Error: "error",
  Ok: "ok",
  // Replaced by a newer request before it ran
  Superseded: "superseded",
} as const;

export type VoiceStatus = (typeof VoiceStatus)[keyof typeof VoiceStatus];
