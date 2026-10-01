// The first word of the one line the resident synthesizer answers a request with
export enum VoiceStatus {
  Error = "error",
  Ok = "ok",
  // Replaced by a newer request before it ran
  Superseded = "superseded",
}
