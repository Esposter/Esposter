import type { MusicObject } from "#src/models/genshinAssets/MusicObject";

import { MusicObjectType } from "#src/models/genshinAssets/MusicObjectType";
import { MusicPlaylistType } from "#src/models/genshinAssets/MusicPlaylistType";
import { parseMusicHierarchy } from "#src/services/genshinAssets/parseMusicHierarchy";
import { describe, expect, test } from "vitest";

const createWords = (...words: number[]): Buffer => {
  const buffer = Buffer.alloc(words.length * 4);
  for (const [index, word] of words.entries()) buffer.writeUInt32LE(word, index * 4);
  return buffer;
};
const createDoubles = (...doubles: number[]): Buffer => {
  const buffer = Buffer.alloc(doubles.length * 8);
  for (const [index, double] of doubles.entries()) buffer.writeDoubleLE(double, index * 8);
  return buffer;
};
const createItem = (itemSegmentId: number, childCount: number, type: MusicPlaylistType, loopCount: number): Buffer => {
  const item = Buffer.alloc(30);
  item.writeUInt32LE(itemSegmentId);
  item.writeUInt32LE(childCount, 8);
  item.writeInt32LE(type, 12);
  item.writeInt16LE(loopCount, 16);
  return item;
};

describe(parseMusicHierarchy, () => {
  const trackId = 1;
  const segmentId = 2;
  const playlistId = 3;
  const sourceId = 4;
  const duration = 1000;
  // Properties a node carries before its children, which the parser skips
  const properties = Buffer.from([0, 7, 0, 0]);
  const meterAndStingers = Buffer.concat([Buffer.alloc(23), createWords(0)]);
  const track: MusicObject = {
    data: Buffer.concat([
      Buffer.from([0]),
      createWords(1),
      Buffer.alloc(14),
      createWords(1, 0, sourceId, 0),
      createDoubles(0, 0, -1, duration + 1),
    ]),
    id: trackId,
    type: MusicObjectType.Track,
  };
  const segment: MusicObject = {
    data: Buffer.concat([
      properties,
      createWords(1, trackId),
      meterAndStingers,
      createDoubles(duration),
      createWords(2, 0),
      createDoubles(0),
      createWords(0, 0),
      createDoubles(duration),
      createWords(0),
    ]),
    id: segmentId,
    type: MusicObjectType.Segment,
  };
  const playlist: MusicObject = {
    data: Buffer.concat([
      properties,
      createWords(1, segmentId),
      meterAndStingers,
      createWords(2),
      createItem(0, 1, MusicPlaylistType.SequenceContinuous, 0),
      createItem(segmentId, 0, MusicPlaylistType.Leaf, 1),
    ]),
    id: playlistId,
    type: MusicObjectType.Playlist,
  };

  test("reads a track's clips, a segment's tracks, duration and cues, and a playlist's tree", () => {
    expect.hasAssertions();

    expect(parseMusicHierarchy([track, segment, playlist])).toStrictEqual({
      playlists: new Map([
        [
          playlistId,
          {
            id: playlistId,
            items: [
              { childCount: 1, loopCount: 0, segmentId: 0, type: MusicPlaylistType.SequenceContinuous },
              { childCount: 0, loopCount: 1, segmentId, type: MusicPlaylistType.Leaf },
            ],
            segmentIds: [segmentId],
          },
        ],
      ]),
      segments: new Map([[segmentId, { cues: [0, duration], duration, id: segmentId, trackIds: [trackId] }]]),
      tracks: new Map([
        [trackId, { clips: [{ beginTrim: 0, duration: duration + 1, endTrim: -1, playAt: 0, sourceId }], id: trackId }],
      ]),
    });
  });
});
