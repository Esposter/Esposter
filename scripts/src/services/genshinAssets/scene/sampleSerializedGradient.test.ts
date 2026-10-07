import { SerializedFieldKind } from "#src/models/genshinAssets/scene/SerializedFieldKind";
import { sampleSerializedGradient } from "#src/services/genshinAssets/scene/sampleSerializedGradient";
import { describe, expect, test } from "vitest";

describe(sampleSerializedGradient, () => {
  test("blends between its colour keys and clamps outside them", () => {
    expect.hasAssertions();

    const gradient = {
      alphaKeys: [{ alpha: 1, time: 0 }],
      colorKeys: [
        { color: [0, 0, 0], time: 0.5 },
        { color: [1, 0.5, 0], time: 1 },
      ],
      kind: SerializedFieldKind.Gradient,
      offset: 0,
    } satisfies Parameters<typeof sampleSerializedGradient>[0];

    expect([0, 0.75].map((time) => sampleSerializedGradient(gradient, time))).toStrictEqual([
      [0, 0, 0],
      [0.5, 0.25, 0],
    ]);
  });
});
