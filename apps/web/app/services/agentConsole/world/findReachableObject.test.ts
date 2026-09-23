import type { WorldPrompt } from "@/models/agentConsole/world/WorldPrompt";

import { findReachableObject } from "@/services/agentConsole/world/findReachableObject";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(findReachableObject, () => {
  const position = new Vector3(0, 1, 0);
  // Facing +z
  const heading = 0;
  const near: Pick<WorldPrompt, "max" | "min" | "standPosition"> = {
    max: [1, 1, 2],
    min: [0, 0, 1],
    standPosition: [0, 1, 0.1],
  };
  const far: Pick<WorldPrompt, "max" | "min" | "standPosition"> = {
    max: [1, 1, 2],
    min: [0, 0, 1],
    standPosition: [0, 1, 1],
  };
  const behind: Pick<WorldPrompt, "max" | "min" | "standPosition"> = {
    max: [1, 1, -1],
    min: [0, 0, -2],
    standPosition: [0, 1, -0.1],
  };

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

    expect(findReachableObject(position, heading, [{ ...near, standPosition: [0, 1, 2] }])).toBeUndefined();
  });
});
