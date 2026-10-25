import { createAvatarBinary } from "#src/services/genshinAssets/avatar/createAvatarBinary";
import { describe, expect, test } from "vitest";

describe("createAvatarBinary", () => {
  test("packs each array after the last, on a four-byte boundary, so it reads without a copy", () => {
    expect.hasAssertions();

    const binary = createAvatarBinary();
    const indices = binary.add(new Uint16Array([1, 2, 3]));
    const positions = binary.add(new Float32Array([0.5, 1, 2]));

    expect(indices).toStrictEqual({ length: 3, offset: 0 });
    expect(positions).toStrictEqual({ length: 3, offset: 8 });
    expect(binary.toBuffer().byteLength).toBe(20);
  });
});
