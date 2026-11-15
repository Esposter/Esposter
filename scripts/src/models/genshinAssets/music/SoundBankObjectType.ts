// The kinds of a Wwise sound bank's hierarchy object the tooling reads, by the type byte each is stored under: the
// Interactive music's, and every node a sound's volume passes through on its way out
export const SoundBankObjectType = {
  Sound: 2,
  RandomSequenceContainer: 5,
  SwitchContainer: 6,
  ActorMixer: 7,
  Bus: 8,
  LayerContainer: 9,
  MusicSegment: 10,
  MusicTrack: 11,
  MusicSwitch: 12,
  MusicPlaylist: 13,
  AuxiliaryBus: 18,
} as const;
export type SoundBankObjectType = (typeof SoundBankObjectType)[keyof typeof SoundBankObjectType];
