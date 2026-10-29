import { projectMapPoint } from "#src/services/map/projectMapPoint";
import { describe, expect, test } from "vitest";

const centre = { x: -1094.6, z: -2699.7 };

describe(projectMapPoint, () => {
  test("places a point with more x than the centre above it, and more z to its right", () => {
    expect.hasAssertions();

    expect({
      above: projectMapPoint({ x: centre.x + 10, z: centre.z }, centre),
      right: projectMapPoint({ x: centre.x, z: centre.z + 10 }, centre),
    }).toStrictEqual({ above: { x: 0, y: -10 }, right: { x: 10, y: 0 } });
  });
});
