import type { MusicClip } from "#src/models/genshinAssets/MusicClip";

// A component's music as its playlist plays it, exported beside its other references: each segment it plays once, by
// Its id, with its length in milliseconds and the clips of its tracks, the order one pass plays them in as indices
// Into them, and whether the playlist loops forever
export interface ComponentPlaylist {
  isLooping: boolean;
  order: number[];
  segments: { clips: MusicClip[]; duration: number; id: number }[];
}
