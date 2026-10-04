import type { MusicPlaylistType } from "#src/models/genshinAssets/music/MusicPlaylistType";

// One item of a playlist's tree, in the order Wwise stores the tree, each group followed by its children: the segment
// A leaf plays, how many children a group has, how its children play and how many times it plays (0 forever)
export interface MusicPlaylistItem {
  childCount: number;
  loopCount: number;
  segmentId: number;
  type: MusicPlaylistType;
}
