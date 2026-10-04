// The keys and velocities a recorded note of a sampled instrument answers, as its SFZ mapping gives them: MIDI keys,
// And velocities from 1 to `MIDI_VELOCITY_MAX`
export interface MusicSampleRange {
  highKey: number;
  highVelocity: number;
  lowKey: number;
  lowVelocity: number;
}
