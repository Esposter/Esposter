// What one clip measures to, before a speaker's clips are pooled: the pooled statistics need every voiced frame
// Rather than one median per clip, so the frames travel with the clip
export interface ClipProfile {
  embedding: Float32Array;
  signalToNoiseDb: number;
  // Speech only — the pauses inside the clip and the silence around it are not counted
  speechSeconds: number;
  syllables: number;
  voicedF0sHz: number[];
}
