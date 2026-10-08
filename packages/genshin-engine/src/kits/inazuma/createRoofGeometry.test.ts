import { createRoofGeometry } from "#src/kits/inazuma/createRoofGeometry";
import { BuildingRoof } from "#src/models/kits/inazuma/BuildingRoof";
import { Triangle, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createRoofGeometry, () => {
  test("faces every triangle out of the roof's solid, whichever way its ridge runs", () => {
    expect.hasAssertions();

    const HEIGHT = 2;
    const interior = new Vector3(0, HEIGHT / 4, 0);
    const outwardFaces = [BuildingRoof.Gabled, BuildingRoof.Hipped].flatMap((roof) => {
      const { position } = createRoofGeometry(roof, 4, 6, HEIGHT).attributes;
      return Array.from({ length: position.count / 3 }, (_, index) => {
        const triangle = new Triangle(
          new Vector3().fromBufferAttribute(position, index * 3),
          new Vector3().fromBufferAttribute(position, index * 3 + 1),
          new Vector3().fromBufferAttribute(position, index * 3 + 2),
        );
        return triangle.getNormal(new Vector3()).dot(triangle.getMidpoint(new Vector3()).sub(interior)) >= 0;
      });
    });

    expect(outwardFaces).not.toContain(false);
  });
});
