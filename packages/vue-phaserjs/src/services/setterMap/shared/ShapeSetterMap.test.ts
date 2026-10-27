import { ShapeSetter } from "#src/models/setterMap/shared/ShapeSetter";
import { ShapeSetterMap } from "#src/services/setterMap/shared/ShapeSetterMap";
import { removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { afterEach, describe, expect, test } from "vitest";

describe("shapeSetterMap", () => {
  const sceneKey = "sceneKey";
  const alpha = 0.1;

  afterEach(() => {
    removeTestScene(sceneKey);
  });

  test("setting the alpha alone leaves the shape unfilled", () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    const circle = scene.add.circle();
    ShapeSetterMap[ShapeSetter.FillAlpha](circle)(alpha);

    expect(circle.fillAlpha).toBe(alpha);
    expect(circle.isFilled).toBe(false);
  });
});
