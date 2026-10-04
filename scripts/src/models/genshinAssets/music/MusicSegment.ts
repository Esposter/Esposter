// A music segment: the tracks it plays together, its length in milliseconds and its cues' positions, the entry cue
// First and the exit cue last
export interface MusicSegment {
  cues: number[];
  duration: number;
  id: number;
  trackIds: number[];
}
