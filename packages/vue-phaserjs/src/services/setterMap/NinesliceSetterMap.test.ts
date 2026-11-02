import { NinesliceSetter } from "#src/models/setterMap/NinesliceSetter";
import { NinesliceSetterMap } from "#src/services/setterMap/NinesliceSetterMap";
import { removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

describe("ninesliceSetterMap", () => {
  const sceneKey = "sceneKey";
  const size = 100;
  const slice = 10;
  const changedSlice = 0.1;

  afterEach(() => {
    removeTestScene(sceneKey);
  });

  // Each row is the four slices in the order leftWidth, rightWidth, topHeight, bottomHeight
  test.each([
    [NinesliceSetter.BottomHeight, [slice, slice, slice, changedSlice]],
    [NinesliceSetter.LeftWidth, [changedSlice, slice, slice, slice]],
    [NinesliceSetter.RightWidth, [slice, changedSlice, slice, slice]],
    [NinesliceSetter.TopHeight, [slice, slice, changedSlice, slice]],
  ])("%s changes only its own slice", (setter, expectedSlices) => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    const nineSlice = scene.add.nineslice(0, 0, "", undefined, size, size, slice, slice, slice, slice);
    const emit = vi.fn<(...args: unknown[]) => void>();
    const setSlice = NinesliceSetterMap[setter];
    assert.exists(setSlice);
    setSlice(nineSlice, emit)(changedSlice);

    expect([nineSlice.leftWidth, nineSlice.rightWidth, nineSlice.topHeight, nineSlice.bottomHeight]).toStrictEqual(
      expectedSlices,
    );
  });
});
