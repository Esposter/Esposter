import type { Quaternion } from "three";

import { describe, expect } from "vitest";

// Quaternions compare component by component, since a turn by zero leaves a signed zero and a pose's slerp leaves rounding
// Which a strict comparison splits
export const expectRotation = (rotation: Quaternion, expected: Quaternion): void => {
  const expectedComponents = expected.toArray();
  for (const [index, component] of rotation.toArray().entries())
    expect(component).toBeCloseTo(expectedComponents[index] ?? Number.NaN);
};

describe.todo("expectRotation");
