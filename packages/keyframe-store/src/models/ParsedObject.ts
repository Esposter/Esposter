// An object split at its header: what the reader needs before it can decompress anything. The base hash is
// What makes a delta self-describing — reconstruction needs nothing but the object itself, so a record that
// Drifted from the object it names can produce a missing answer but never a wrong one
export interface ParsedObject {
  // Empty on a keyframe
  baseHash: string;
  payload: Uint8Array;
  // The window the encoder used, which the decoder must be told or it refuses a frame that was legal when written
  windowLog: number;
}
