// A note in the model's frames: where it starts, how many frames it lasts, its MIDI pitch, its mean frame reading as
// Its amplitude, and its pitch bend at each frame, in contour bins (a third of a semitone each) from its pitch
export interface NoteEvent {
  amplitude: number;
  durationFrames: number;
  pitchBends?: number[];
  pitchMidi: number;
  startFrame: number;
}
