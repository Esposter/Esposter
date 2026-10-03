// A note in seconds: when it starts, how long it lasts, its MIDI pitch, its amplitude from 0 to 1, and its pitch bend
// At each of the model's frames it spans, in contour bins (a third of a semitone each) from its pitch
export interface NoteEventTime {
  amplitude: number;
  durationSeconds: number;
  pitchBends?: number[];
  pitchMidi: number;
  startTimeSeconds: number;
}
