import type { WorldBox } from "@/models/agentConsole/world/WorldBox";

import { REACH_DISTANCE } from "@/services/agentConsole/world/constants";
import { findReachableObject } from "@/services/agentConsole/world/findReachableObject";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(findReachableObject, () => {
  const position = new Vector3(0, 1, 0);
  // Facing +z
  const heading = 0;
  const near: WorldBox = { max: [1, 1, 1], min: [0, 0, 0.1] };
  const far: WorldBox = { max: [1, 1, 2], min: [0, 0, 1] };
  const behind: WorldBox = { max: [1, 1, -1], min: [0, 0, -2] };

  test("finds the nearest thing in reach", () => {
    expect.hasAssertions();

    expect(findReachableObject(position, heading, [far, near])).toBe(near);
  });

  test("passes over a thing behind the player", () => {
    expect.hasAssertions();

    expect(findReachableObject(position, heading, [behind])).toBeUndefined();
  });

  test("passes over a thing out of reach", () => {
    expect.hasAssertions();

    const outOfReach: WorldBox = { max: [1, 1, REACH_DISTANCE + 1], min: [0, 0, REACH_DISTANCE + 0.1] };

    expect(findReachableObject(position, heading, [outOfReach])).toBeUndefined();
  });

  test("reaches a long thing by its nearest end, its middle far off", () => {
    expect.hasAssertions();

    const panel: WorldBox = { max: [8.5, 1, 1], min: [0.5, 0, 0.9] };

    expect(findReachableObject(position, heading, [panel])).toBe(panel);
  });
});
