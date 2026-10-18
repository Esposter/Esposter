import { createInstanceMatrixBuffer } from "#src/culling/createInstanceMatrixBuffer";
import { Matrix4 } from "three";
import { describe, expect, test } from "vitest";

describe(createInstanceMatrixBuffer, () => {
  test("an instance's matrix is its elements in column order, one instance after another", () => {
    expect.hasAssertions();

    const translation = new Matrix4().makeTranslation(1, 2, 3);
    const scale = new Matrix4().makeScale(2, 3, 4);
    const { array } = createInstanceMatrixBuffer([translation, scale]);

    expect(array).toStrictEqual(
      new Float32Array([
        1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 0, 0, 0, 1,
      ]),
    );
  });
});
