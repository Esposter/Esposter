import { createLoginTowerSlabGeometry } from "#src/services/login/tower/createLoginTowerSlabGeometry";
import { describe, expect, test } from "vitest";

describe(createLoginTowerSlabGeometry, () => {
  test("stops a slab running past the seam short of a whole turn", () => {
    expect.hasAssertions();

    const breadth = 100;
    const positions = createLoginTowerSlabGeometry([10, 1, 90, breadth + 0.5, 0, 1], breadth).getAttribute("position");
    // How far round the tower each corner stands, as the towers' geometry reads it for its facade
    const turns = Array.from({ length: positions.count }, (_value, index) => {
      const angle = Math.atan2(positions.getX(index), positions.getZ(index));
      return angle / (2 * Math.PI) + (angle < 0 ? 1 : 0);
    });

    expect(Math.min(...turns)).toBeGreaterThan(0.89);
  });
});
