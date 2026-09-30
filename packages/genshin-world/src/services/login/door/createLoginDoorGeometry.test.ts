import { LOGIN_DOOR } from "#src/services/login/door/constants";
import { createLoginDoorGeometry } from "#src/services/login/door/createLoginDoorGeometry";
import { Box3 } from "three";
import { describe, expect, test } from "vitest";

describe(createLoginDoorGeometry, () => {
  const { depth, height, plinthHeight, recess, width } = LOGIN_DOOR;

  test("stands the door on its plinth, its head at its height and its panel recessed behind its frame", () => {
    expect.hasAssertions();

    const { frame, panel } = createLoginDoorGeometry();
    frame.computeBoundingBox();
    panel.computeBoundingBox();
    const frameBox = frame.boundingBox ?? new Box3();
    const panelBox = panel.boundingBox ?? new Box3();

    expect(frameBox.min.y).toBeCloseTo(0);
    expect(frameBox.max.y).toBeCloseTo(plinthHeight + height);
    expect(frameBox.max.x).toBeCloseTo(width / 2 + LOGIN_DOOR.border);
    expect(panelBox.max.z).toBeCloseTo(depth / 2 - recess);
    expect(panelBox.max.x).toBeLessThan(width / 2);
  });
});
