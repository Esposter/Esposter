import { createPipeworkGeometry } from "#src/services/nod-krai/createPipeworkGeometry";
import { Box3, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createPipeworkGeometry, () => {
  test("lays each run between its two ends, whatever direction it runs", () => {
    expect.hasAssertions();

    const geometry = createPipeworkGeometry([{ from: new Vector3(0, 0, 0), to: new Vector3(6, 0, 0) }], 1);
    geometry.computeBoundingBox();
    const { max, min } = geometry.boundingBox ?? new Box3();

    expect(min.x).toBeCloseTo(0);
    expect(max.x).toBeCloseTo(6);
    expect(min.y).toBeCloseTo(-1);
    expect(max.y).toBeCloseTo(1);
  });
});
