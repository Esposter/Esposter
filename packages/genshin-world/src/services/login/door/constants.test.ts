import walkway from "#src/data/login/walkway.json";
import { LOGIN_DOOR, LOGIN_DOOR_POSITION } from "#src/services/login/door/constants";
import { describe, expect, test } from "vitest";

// The door's width over the walkway's where the door stands, in the English recording's last pose of the current build:
// Its frame 202 pixels wide over the walkway's 227 a few metres before it. A ratio no camera changes, so the fitted
// Arrangement is checked before any pose is searched for
const DOOR_WALKWAY_WIDTH_RATIO = 0.9;
const RATIO_TOLERANCE = 0.15;

describe(LOGIN_DOOR, () => {
  test("stands about as wide as the walkway at its foot", () => {
    expect.hasAssertions();

    const halfWidths = walkway.outline
      .filter(([, z]) => Math.abs(z - LOGIN_DOOR_POSITION[2]) < 1)
      .map(([x]) => Math.abs(x));
    const walkwayWidth = Math.min(...halfWidths) * 2;

    expect(Math.abs(LOGIN_DOOR.width / walkwayWidth - DOOR_WALKWAY_WIDTH_RATIO)).toBeLessThan(RATIO_TOLERANCE);
  });
});
