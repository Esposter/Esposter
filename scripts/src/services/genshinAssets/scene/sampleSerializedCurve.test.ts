import { CurveWrapMode } from "#src/models/genshinAssets/scene/CurveWrapMode";
import { SerializedFieldKind } from "#src/models/genshinAssets/scene/SerializedFieldKind";
import { sampleSerializedCurve } from "#src/services/genshinAssets/scene/sampleSerializedCurve";
import { describe, expect, test } from "vitest";

describe(sampleSerializedCurve, () => {
  const keys = [
    { inSlope: 0, outSlope: 0, time: 0, value: 0 },
    { inSlope: 0, outSlope: Infinity, time: 1, value: 1 },
    { inSlope: 0, outSlope: 0, time: 2, value: 3 },
  ];

  test("eases between flat keys, holds a step until its next key and clamps outside its keys", () => {
    expect.hasAssertions();

    const curve = {
      keys,
      kind: SerializedFieldKind.Curve,
      offset: 0,
      postWrap: CurveWrapMode.Clamp,
      preWrap: CurveWrapMode.Clamp,
    } satisfies Parameters<typeof sampleSerializedCurve>[0];

    expect([-1, 0.25, 0.5, 1.5, 2, 3].map((time) => sampleSerializedCurve(curve, time))).toStrictEqual([
      0, 0.15625, 0.5, 1, 3, 3,
    ]);
  });

  test("repeats and mirrors outside its keys by its wrap modes", () => {
    expect.hasAssertions();

    const curve = {
      keys,
      kind: SerializedFieldKind.Curve,
      offset: 0,
      postWrap: CurveWrapMode.Repeat,
      preWrap: CurveWrapMode.PingPong,
    } satisfies Parameters<typeof sampleSerializedCurve>[0];

    expect([-0.5, -1.5, 2.5, 3.5].map((time) => sampleSerializedCurve(curve, time))).toStrictEqual([0.5, 1, 0.5, 1]);
  });
});
