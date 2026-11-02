import { IsoSetter } from "#src/models/setterMap/shared/IsoSetter";
import { IsoBoxSetterMap } from "#src/services/setterMap/IsoBoxSetterMap";
import { IsoTriangleSetterMap } from "#src/services/setterMap/IsoTriangleSetterMap";
import { IsoSetterMap } from "#src/services/setterMap/shared/IsoSetterMap";
import { removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { afterEach, describe, expect, test } from "vitest";

describe("isoSetterMap", () => {
  const sceneKey = "sceneKey";
  const size = 10;
  const height = 20;
  const changedSize = 30;
  const changedHeight = 40;

  afterEach(() => {
    removeTestScene(sceneKey);
  });

  test.each(Object.entries(IsoSetterMap))("carries %s into both isometric setter maps", (key, setter) => {
    expect.hasAssertions();

    expect(IsoBoxSetterMap[key as keyof typeof IsoBoxSetterMap]).toBe(setter);
    expect(IsoTriangleSetterMap[key as keyof typeof IsoTriangleSetterMap]).toBe(setter);
  });

  test.each([
    [IsoSetter.Height, changedHeight, [size, changedHeight]],
    [IsoSetter.Size, changedSize, [changedSize, height]],
  ] as const)("%s changes only its own dimension", (setter, value, expectedDimensions) => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    const isoBox = scene.add.isobox(0, 0, size, height);
    IsoSetterMap[setter](isoBox)(value);

    expect([isoBox.width, isoBox.height]).toStrictEqual(expectedDimensions);
  });
});
