import { createFlowerGeometry } from "#src/vegetation/createFlowerGeometry";
import { describe, expect, test } from "vitest";

describe(createFlowerGeometry, () => {
  test("gives every vertex a normal, so the toon material lights it", () => {
    expect.hasAssertions();

    const geometry = createFlowerGeometry();

    expect(geometry.getAttribute("normal").count).toBe(geometry.getAttribute("position").count);
  });
});
