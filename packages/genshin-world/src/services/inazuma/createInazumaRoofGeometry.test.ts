import { InazumaBuildingRoof } from "#src/models/inazuma/InazumaBuildingRoof";
import { createInazumaRoofGeometry } from "#src/services/inazuma/createInazumaRoofGeometry";
import { Triangle, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(createInazumaRoofGeometry, () => {
  test("faces every triangle out of the roof's solid, whichever way its ridge runs", () => {
    expect.hasAssertions();

    const HEIGHT = 2;
    const interior = new Vector3(0, HEIGHT / 4, 0);
    const outwardFaces = [InazumaBuildingRoof.Gabled, InazumaBuildingRoof.Hipped].flatMap((roof) => {
      const { position } = createInazumaRoofGeometry(roof, 4, 6, HEIGHT).attributes;
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
