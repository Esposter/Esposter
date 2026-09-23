import {
  DOOR_HEIGHT,
  DOOR_MAX_Z,
  DOOR_MIN_Z,
  DOOR_OPEN_ANGLE,
  DOOR_THICKNESS,
} from "@/services/agentConsole/world/constants";
import { getDoorBox } from "@/services/agentConsole/world/getDoorBox";
import { describe, expect, test } from "vitest";

describe(getDoorBox, () => {
  const width = DOOR_MAX_Z - DOOR_MIN_Z + 1;

  test.each([
    // Closed: across the opening on the wall's outer face
    { angle: 0, max: [0, DOOR_HEIGHT + 1, DOOR_MAX_Z + 1], min: [-DOOR_THICKNESS, 1, DOOR_MIN_Z] },
    // Open: straight out from the wall beside the opening
    {
      angle: DOOR_OPEN_ANGLE,
      max: [0, DOOR_HEIGHT + 1, DOOR_MAX_Z + 1 + DOOR_THICKNESS],
      min: [-width, 1, DOOR_MAX_Z + 1],
    },
  ])("outlines the panel as drawn at $angle", ({ angle, max, min }) => {
    expect.hasAssertions();

    const box = getDoorBox(angle);

    for (const [index, value] of max.entries()) expect(box.max[index]).toBeCloseTo(value);
    for (const [index, value] of min.entries()) expect(box.min[index]).toBeCloseTo(value);
  });
});
