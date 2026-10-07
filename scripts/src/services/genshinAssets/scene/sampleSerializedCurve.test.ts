import { SerializedFieldKind } from "#src/models/genshinAssets/scene/SerializedFieldKind";
import { sampleSerializedCurve } from "#src/services/genshinAssets/scene/sampleSerializedCurve";
import { describe, expect, test } from "vitest";

describe(sampleSerializedCurve, () => {
  test("eases between flat keys, holds a step and clamps outside its keys", () => {
    expect.hasAssertions();

    const curve = {
      keys: [
        { inSlope: 0, outSlope: 0, time: 0, value: 0 },
        { inSlope: 0, outSlope: Infinity, time: 1, value: 1 },
        { inSlope: 0, outSlope: 0, time: 2, value: 3 },
      ],
      kind: SerializedFieldKind.Curve,
      offset: 0,
    } satisfies Parameters<typeof sampleSerializedCurve>[0];

    expect([-1, 0.25, 0.5, 1.5, 3].map((time) => sampleSerializedCurve(curve, time))).toStrictEqual([
      0, 0.15625, 0.5, 1, 3,
    ]);
  });
});
