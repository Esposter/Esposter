import { measureAvatarHeight } from "#src/services/genshinAssets/measure/measureAvatarHeight";
import { describe, expect, test } from "vitest";

describe(measureAvatarHeight, () => {
  test("spans every mesh's positions, each read from the binary at its view", () => {
    expect.hasAssertions();

    const first = new Float32Array([0, 0, 0, 0, 1, 0]);
    const second = new Float32Array([0, -0.5, 0, 0, 2.5, 0]);
    const binary = Buffer.concat([Buffer.from(first.buffer), Buffer.from(second.buffer)]);
    const meshes = [
      { positions: { length: first.length, offset: 0 } },
      { positions: { length: second.length, offset: first.byteLength } },
    ];

    expect(measureAvatarHeight({ meshes }, binary)).toBe(2.5 - -0.5);
  });
});
