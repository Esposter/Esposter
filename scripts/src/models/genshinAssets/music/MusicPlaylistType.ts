// How a playlist group plays its children, as Wwise stores it; a leaf, which plays one segment, stores none
export const MusicPlaylistType = {
  Leaf: -1,
  SequenceContinuous: 0,
  SequenceStep: 1,
  RandomContinuous: 2,
  RandomStep: 3,
} as const;
export type MusicPlaylistType = (typeof MusicPlaylistType)[keyof typeof MusicPlaylistType];
