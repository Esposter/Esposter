import { createInstancedGeometry } from "#src/culling/createInstancedGeometry";
import { BoxGeometry } from "three";
import { describe, expect, test } from "vitest";

describe(createInstancedGeometry, () => {
  test("draws its source's vertices once for every instance, sharing the source's attributes and index", () => {
    expect.hasAssertions();

    const geometry = new BoxGeometry();
    const instancedGeometry = createInstancedGeometry(geometry, 5);

    expect(instancedGeometry.instanceCount).toBe(5);
    expect(instancedGeometry.getAttribute("position")).toBe(geometry.getAttribute("position"));
    expect(instancedGeometry.getIndex()).toBe(geometry.getIndex());
  });
});
