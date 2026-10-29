import { projectMapPoint } from "#src/services/map/projectMapPoint";
import { unprojectMapPoint } from "#src/services/map/unprojectMapPoint";
import { describe, expect, test } from "vitest";

describe(unprojectMapPoint, () => {
  const centre = { x: -1094.6, z: -2699.7 };

  test("turns a place on the map back into the catalogue point it was drawn from", () => {
    expect.hasAssertions();

    const point = { x: centre.x + 37.5, z: centre.z - 12.25 };
    expect(unprojectMapPoint(projectMapPoint(point, centre), centre)).toStrictEqual(point);
  });

  test("turns a click above the centre into a point with more x, and one to its right into more z", () => {
    expect.hasAssertions();

    expect({
      above: unprojectMapPoint({ x: 0, y: -10 }, centre),
      right: unprojectMapPoint({ x: 10, y: 0 }, centre),
    }).toStrictEqual({ above: { x: centre.x + 10, z: centre.z }, right: { x: centre.x, z: centre.z + 10 } });
  });
});
