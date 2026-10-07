import type { SoundBankObject } from "#src/models/genshinAssets/music/SoundBankObject";

import { SoundBankObjectType } from "#src/models/genshinAssets/music/SoundBankObjectType";
import { WwiseCurveInterpolation } from "#src/models/genshinAssets/music/WwiseCurveInterpolation";
import { WwiseCurveParameter } from "#src/models/genshinAssets/music/WwiseCurveParameter";
import { WwiseCurveScaling } from "#src/models/genshinAssets/music/WwiseCurveScaling";
import { WwiseProperty } from "#src/models/genshinAssets/music/WwiseProperty";
import { computeWwiseVolume } from "#src/services/genshinAssets/music/computeWwiseVolume";
import { describe, expect, test } from "vitest";

const createWords = (...words: number[]): Buffer => {
  const buffer = Buffer.alloc(words.length * 4);
  for (const [index, word] of words.entries()) buffer.writeUInt32LE(word, index * 4);
  return buffer;
};
const createProperties = (propertyValueMap: ReadonlyMap<number, number>): Buffer => {
  const values = Buffer.alloc(propertyValueMap.size * 4);
  for (const [index, value] of [...propertyValueMap.values()].entries()) values.writeFloatLE(value, index * 4);
  return Buffer.concat([Buffer.from([propertyValueMap.size, ...propertyValueMap.keys()]), values]);
};
// One game parameter's curve on a property, two points flat at a stored value
const createCurve = (gameParameterId: number, parameter: WwiseCurveParameter, stored: number): Buffer => {
  const points = Buffer.alloc(24);
  for (const [index, from] of [0, 1].entries()) {
    points.writeFloatLE(from, index * 12);
    points.writeFloatLE(stored, index * 12 + 4);
    points.writeUInt32LE(WwiseCurveInterpolation.Linear, index * 12 + 8);
  }
  return Buffer.concat([
    createWords(gameParameterId),
    Buffer.from([0, 0, parameter]),
    createWords(0),
    Buffer.from([WwiseCurveScaling.Decibels, 2, 0]),
    points,
  ]);
};
// A node's base parameters: no effects, its bus and parent, its properties, then nothing positioned, sent, limited or
// Stated, and no curves
const createNodeBase = (busId: number, parentId: number, propertyValueMap: ReadonlyMap<number, number>): Buffer =>
  Buffer.concat([
    Buffer.from([0, 0, 0]),
    createWords(busId, parentId),
    Buffer.from([0]),
    createProperties(propertyValueMap),
    Buffer.from([0, 0, 0]),
    Buffer.alloc(6),
    Buffer.from([0, 0, 0, 0]),
  ]);
// A bus: its parent bus, the device a master bus names, its properties, then nothing positioned, sent or ducked, no
// Effects, and its curves
const createBus = (parentId: number, propertyValueMap: ReadonlyMap<number, number>, curves: Buffer[]): Buffer => {
  const curveCount = Buffer.alloc(2);
  curveCount.writeUInt16LE(curves.length);
  return Buffer.concat([
    createWords(parentId),
    parentId === 0 ? createWords(0) : Buffer.alloc(0),
    createProperties(propertyValueMap),
    Buffer.from([0, 0]),
    Buffer.alloc(16),
    createWords(0),
    Buffer.from([0]),
    Buffer.alloc(6),
    curveCount,
    ...curves,
  ]);
};

describe(computeWwiseVolume, () => {
  const trackId = 1;
  const segmentId = 2;
  const busId = 3;
  const masterBusId = 4;
  const gameParameterId = 5;

  test("sums a track's volume up its parents, then its bus's up to the master's at the game parameters' defaults", () => {
    expect.hasAssertions();

    const objects: SoundBankObject[] = [
      {
        // A track with no clips keeps no sub-track count
        data: Buffer.concat([
          Buffer.from([0]),
          createWords(0, 0, 0),
          createNodeBase(0, segmentId, new Map([[WwiseProperty.Volume, -1]])),
        ]),
        id: trackId,
        type: SoundBankObjectType.MusicTrack,
      },
      {
        data: Buffer.concat([Buffer.from([0]), createNodeBase(busId, 0, new Map([[WwiseProperty.Volume, -2]]))]),
        id: segmentId,
        type: SoundBankObjectType.MusicSegment,
      },
      {
        data: createBus(masterBusId, new Map([[WwiseProperty.BusVolume, -4]]), [
          // An amplitude of a half below unity at the default is about six decibels down
          createCurve(gameParameterId, WwiseCurveParameter.OutputBusVolume, -0.5),
        ]),
        id: busId,
        type: SoundBankObjectType.Bus,
      },
      {
        data: createBus(0, new Map([[WwiseProperty.BusVolume, -8]]), []),
        id: masterBusId,
        type: SoundBankObjectType.Bus,
      },
    ];

    expect(
      computeWwiseVolume(
        trackId,
        new Map(objects.map((object) => [object.id, object])),
        new Map([[gameParameterId, 0]]),
      ),
    ).toBeCloseTo(-15 + 20 * Math.log10(0.5));
  });
});
