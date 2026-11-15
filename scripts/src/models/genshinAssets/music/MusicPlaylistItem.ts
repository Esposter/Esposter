// One item of a playlist's tree, in the order Wwise stores the tree, each group followed by its children: the segment
// A leaf plays, how many children a group has, how its children play and how many times it plays (0 forever). How its
// Children play is the code as the bank holds it, a MusicPlaylistType's or one the tooling has not read
export interface MusicPlaylistItem {
  childCount: number;
  loopCount: number;
  segmentId: number;
  type: number;
}
