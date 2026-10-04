import type { MusicHierarchy } from "#src/models/genshinAssets/music/MusicHierarchy";
import type { MusicObject } from "#src/models/genshinAssets/music/MusicObject";
import type { MusicPlaylistItem } from "#src/models/genshinAssets/music/MusicPlaylistItem";
import type { MusicClip } from "#src/models/genshinAssets/shared/MusicClip";

import { MusicObjectType } from "#src/models/genshinAssets/music/MusicObjectType";

// A track's source: its plugin, how it streams, its id, its size in memory and its bits; and a clip of one: its track
// Index, its source, an event, then where it plays, its trims and its source's duration as doubles
const SOURCE_LENGTH = 14;
const CLIP_LENGTH = 44;
// After a container's children, its meter (grid period and offset as doubles, a tempo and the time signature's two
// Bytes) and a flag, then its stingers, six words each
const METER_LENGTH = 23;
const STINGER_LENGTH = 24;
// The most children a container's count is read as, so a stray word is not taken for a count
const MAX_CHILD_COUNT = 512;
// A playlist's item: its segment, its own id, its child count, how it plays, three loop counts as shorts, a weight, an
// Avoid-repeat count and two flags
const PLAYLIST_ITEM_LENGTH = 30;
const MAX_PLAYLIST_ITEM_COUNT = 4096;
// Wwise's sound banks' interactive music read from their objects' bytes (bank version 134): each track's clips, each
// Segment's tracks, duration and cues, and each playlist's segments and the tree of items it plays them in. The
// Properties every node carries before its children vary in length with what is set on them, so a container's
// Children are found as the first count followed by that many ids of the kind it holds, and what follows them is read
// From there; a playlist's tree ends its bytes, so it is found back from the end
export const parseMusicHierarchy = (objects: readonly MusicObject[]): MusicHierarchy => {
  const idTypeMap = new Map(objects.map(({ id, type }) => [id, type]));
  const findChildren = (
    data: Buffer,
    childTypes: readonly MusicObjectType[],
  ): undefined | { end: number; ids: number[] } => {
    for (let offset = 0; offset + 4 <= data.length; offset++) {
      const count = data.readUInt32LE(offset);
      if (count < 1 || count > MAX_CHILD_COUNT || offset + 4 + 4 * count > data.length) continue;
      const ids = Array.from({ length: count }, (_value, index) => data.readUInt32LE(offset + 4 + 4 * index));
      if (
        ids.every((id) => {
          const childType = idTypeMap.get(id);
          return childType !== undefined && childTypes.includes(childType);
        })
      )
        return { end: offset + 4 + 4 * count, ids };
    }
    return undefined;
  };
  const hierarchy: MusicHierarchy = { playlists: new Map(), segments: new Map(), tracks: new Map() };
  for (const { data, id, type } of objects)
    if (type === MusicObjectType.Track) {
      const sourceCount = data.readUInt32LE(1);
      const clipOffset = 5 + sourceCount * SOURCE_LENGTH;
      const clips: MusicClip[] = Array.from({ length: data.readUInt32LE(clipOffset) }, (_value, index) => {
        const offset = clipOffset + 4 + index * CLIP_LENGTH;
        return {
          beginTrim: data.readDoubleLE(offset + 20),
          duration: data.readDoubleLE(offset + 36),
          endTrim: data.readDoubleLE(offset + 28),
          playAt: data.readDoubleLE(offset + 12),
          sourceId: data.readUInt32LE(offset + 4),
        };
      });
      hierarchy.tracks.set(id, { clips: clips.filter(({ sourceId }) => sourceId !== 0), id });
    } else if (type === MusicObjectType.Segment) {
      const children = findChildren(data, [MusicObjectType.Track]);
      if (!children) continue;
      let offset = children.end + METER_LENGTH;
      offset += 4 + data.readUInt32LE(offset) * STINGER_LENGTH;
      const duration = data.readDoubleLE(offset);
      offset += 8;
      const cues: number[] = [];
      for (let cueOffset = offset + 4, index = data.readUInt32LE(offset); index > 0; index--) {
        cues.push(data.readDoubleLE(cueOffset + 4));
        cueOffset += 16 + data.readUInt32LE(cueOffset + 12);
      }
      hierarchy.segments.set(id, { cues, duration, id, trackIds: children.ids });
    } else if (type === MusicObjectType.Playlist) {
      const children = findChildren(data, [MusicObjectType.Segment, MusicObjectType.Playlist, MusicObjectType.Switch]);
      if (!children) continue;
      for (let count = 1; count <= MAX_PLAYLIST_ITEM_COUNT; count++) {
        const offset = data.length - 4 - count * PLAYLIST_ITEM_LENGTH;
        if (offset < children.end) break;
        if (data.readUInt32LE(offset) !== count) continue;
        const items: MusicPlaylistItem[] = Array.from({ length: count }, (_value, index) => {
          const itemOffset = offset + 4 + index * PLAYLIST_ITEM_LENGTH;
          return {
            childCount: data.readUInt32LE(itemOffset + 8),
            loopCount: data.readInt16LE(itemOffset + 16),
            segmentId: data.readUInt32LE(itemOffset),
            type: data.readInt32LE(itemOffset + 12),
          };
        });
        hierarchy.playlists.set(id, { id, items, segmentIds: children.ids });
        break;
      }
    }
  return hierarchy;
};
