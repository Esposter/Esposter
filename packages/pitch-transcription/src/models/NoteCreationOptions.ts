// How readings become notes: the least onset reading a note starts at, the least frame reading it lasts while, the
// Fewest frames it may last, whether onsets are also inferred from jumps in the frame readings, the highest and lowest
// Frequency kept in hertz, whether the energy left after the onsets is followed into further notes (the melodia trick),
// And how many frames under the threshold a note bridges
export interface NoteCreationOptions {
  energyTolerance?: number;
  frameThreshold?: number;
  isInferringOnsets?: boolean;
  isMelodiaTrick?: boolean;
  maxFrequency?: number;
  minFrequency?: number;
  minNoteLength?: number;
  onsetThreshold?: number;
}
