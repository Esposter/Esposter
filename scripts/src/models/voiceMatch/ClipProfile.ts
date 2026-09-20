// What one clip measures to: its speaker embedding, and the two numbers that decide whether it can be a reference
export interface ClipProfile {
  embedding: Float32Array;
  signalToNoiseDb: number;
  // Speech only — the pauses inside the clip and the silence around it are not counted
  speechSeconds: number;
}
