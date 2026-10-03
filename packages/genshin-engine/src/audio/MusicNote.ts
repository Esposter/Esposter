// One note of a voice: its start within its segment and its length in seconds, its MIDI pitch, and its velocity, the
// Share of its instrument's level its peak reaches
export interface MusicNote {
  duration: number;
  pitch: number;
  start: number;
  velocity: number;
}
