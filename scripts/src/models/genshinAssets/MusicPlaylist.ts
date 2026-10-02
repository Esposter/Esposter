import type { MusicPlaylistItem } from "#src/models/genshinAssets/MusicPlaylistItem";

// A music playlist container: the segments it may play and the tree of items that orders them
export interface MusicPlaylist {
  id: number;
  items: MusicPlaylistItem[];
  segmentIds: number[];
}
