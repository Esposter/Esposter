// One speaker — a character over their clips, or a catalogue voice over its carrier — reduced to the numbers the
// Ranking compares: a unit speaker embedding for timbre, and the three prosody statistics the field keeps
export interface VoiceProfile {
  clipCount: number;
  embedding: number[];
  medianF0Hz: number;
  // The standard deviation of log-F0 over voiced frames, in semitones
  pitchSpreadSemitones: number;
  signalToNoiseDb: number;
  speechSeconds: number;
  syllablesPerSecond: number;
}
