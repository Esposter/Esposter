import type { MusicPlaylist } from "#src/models/genshinAssets/music/MusicPlaylist";

import { MusicPlaylistType } from "#src/models/genshinAssets/music/MusicPlaylistType";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The segments one pass of a playlist plays, in order: its tree of items walked from its root, each group followed by
// Its children, a sequence's children in turn and a leaf's segment as many times as it loops. A random group has no one
// Order, so it is refused rather than guessed, as is a leaf that loops forever inside the pass
export const resolveMusicPlaylistSegments = ({ id, items }: MusicPlaylist): number[] => {
  let index = 0;
  const walk = (isRoot: boolean): number[] => {
    const item = items[index++];
    if (!item) throw new InvalidOperationError(Operation.Read, String(id), "ends inside a group");
    if (item.type === MusicPlaylistType.Leaf) {
      if (item.loopCount < 1) throw new InvalidOperationError(Operation.Read, String(id), "loops a segment forever");
      return Array.from({ length: item.loopCount }, () => item.segmentId);
    }
    if (![MusicPlaylistType.SequenceContinuous, MusicPlaylistType.SequenceStep].includes(item.type))
      throw new InvalidOperationError(Operation.Read, String(id), "plays a group in a random order");
    const children = Array.from({ length: item.childCount }, () => walk(false)).flat();
    // The root's loop count is how often the playlist repeats, which a pass is one of
    if (isRoot) return children;
    if (item.loopCount < 1) throw new InvalidOperationError(Operation.Read, String(id), "loops a group forever");
    return Array.from({ length: item.loopCount }, () => children).flat();
  };
  return walk(true);
};
