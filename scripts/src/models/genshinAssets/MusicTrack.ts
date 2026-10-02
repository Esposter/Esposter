import type { MusicClip } from "#src/models/genshinAssets/MusicClip";

// A music track: the clips of its sources it plays inside its segment
export interface MusicTrack {
  clips: MusicClip[];
  id: number;
}
