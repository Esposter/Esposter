import { GradientMode } from "#src/models/genshinAssets/scene/GradientMode";
import { SerializedFieldKind } from "#src/models/genshinAssets/scene/SerializedFieldKind";
import { sampleSerializedGradient } from "#src/services/genshinAssets/scene/sampleSerializedGradient";
import { describe, expect, test } from "vitest";

describe(sampleSerializedGradient, () => {
  const keys = {
    alphaKeys: [
      { alpha: 1, time: 0 },
      { alpha: 0, time: 1 },
    ],
    colorKeys: [
      { color: [0, 0, 0], time: 0.5 },
      { color: [1, 0.5, 0], time: 1 },
    ],
  } satisfies Pick<Parameters<typeof sampleSerializedGradient>[0], "alphaKeys" | "colorKeys">;

  test("blends between its colour keys and its alpha keys and clamps outside them", () => {
    expect.hasAssertions();

    const gradient = {
      ...keys,
      kind: SerializedFieldKind.Gradient,
      mode: GradientMode.Blend,
      offset: 0,
    } satisfies Parameters<typeof sampleSerializedGradient>[0];

    expect([0, 0.75].map((time) => sampleSerializedGradient(gradient, time))).toStrictEqual([
      [0, 0, 0, 1],
      [0.5, 0.25, 0, 0.25],
    ]);
  });

  test("holds the first key after the time in the fixed mode", () => {
    expect.hasAssertions();

    const gradient = {
      ...keys,
      kind: SerializedFieldKind.Gradient,
      mode: GradientMode.Fixed,
      offset: 0,
    } satisfies Parameters<typeof sampleSerializedGradient>[0];

    expect([0.75, 1].map((time) => sampleSerializedGradient(gradient, time))).toStrictEqual([
      [1, 0.5, 0, 0],
      [1, 0.5, 0, 0],
    ]);
  });
});
