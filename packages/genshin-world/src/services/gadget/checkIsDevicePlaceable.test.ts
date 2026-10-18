import { checkIsDevicePlaceable } from "#src/services/gadget/checkIsDevicePlaceable";
import { describe, expect, test } from "vitest";

describe(checkIsDevicePlaceable, () => {
  const device = { maxCountByPlayer: 1, maxCountInScene: 5 };

  test("a placed device is refused past its scene or player limit", () => {
    expect.hasAssertions();

    expect(checkIsDevicePlaceable(device, 4, 0)).toBe(true);
    expect(checkIsDevicePlaceable(device, 5, 0)).toBe(false);
    expect(checkIsDevicePlaceable(device, 4, 1)).toBe(false);
  });
});
