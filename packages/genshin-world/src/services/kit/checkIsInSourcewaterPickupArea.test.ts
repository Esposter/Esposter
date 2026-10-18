import { checkIsInSourcewaterPickupArea } from "#src/services/kit/checkIsInSourcewaterPickupArea";
import { describe, expect, test } from "vitest";

describe(checkIsInSourcewaterPickupArea, () => {
  test("picks up the droplets in its box or its fan ahead of a body facing zero", () => {
    expect.hasAssertions();

    // Ahead of a body facing zero lies at negative z
    const body = { facing: 0, height: 0, position: { x: 0, z: 0 } };
    const isIn = (x: number, z: number) => checkIsInSourcewaterPickupArea(body, { x, z });
    expect([
      isIn(0, -10),
      isIn(0, 6),
      isIn(0, 8),
      isIn(5, -1),
      isIn(3, -10),
      isIn(0, -13),
      isIn(0, -15),
      isIn(9, -9),
      isIn(6.5, -11),
    ]).toStrictEqual([true, true, false, false, true, true, false, false, true]);
  });

  test("turns with the body's facing", () => {
    expect.hasAssertions();

    // Ahead of a body facing a quarter turn lies at negative x
    const body = { facing: Math.PI / 2, height: 0, position: { x: 0, z: 0 } };
    expect([
      checkIsInSourcewaterPickupArea(body, { x: -10, z: 0 }),
      checkIsInSourcewaterPickupArea(body, { x: 0, z: -10 }),
    ]).toStrictEqual([true, false]);
  });
});
