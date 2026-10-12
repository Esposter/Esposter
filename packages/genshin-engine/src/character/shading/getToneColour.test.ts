import { getToneColour } from "#src/character/shading/getToneColour";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(getToneColour, () => {
  test("keeps a colour at no desaturation and no contrast", () => {
    expect.hasAssertions();

    expect(getToneColour(new Vector3(0.2, 0.4, 0.6), 0, 0)).toStrictEqual(new Vector3(0.2, 0.4, 0.6));
  });

  test("pushes each channel away from mid grey by one plus the contrast scale", () => {
    expect.hasAssertions();

    const toned = getToneColour(new Vector3(0.7, 0.5, 0.3), 0, 1);

    expect(toned.x).toBeCloseTo(0.9);
    expect(toned.y).toBeCloseTo(0.5);
    expect(toned.z).toBeCloseTo(0.1);
  });
});
