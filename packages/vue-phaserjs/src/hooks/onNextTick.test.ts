import { onNextTick } from "@/hooks/onNextTick";
import { removeTestScene, startTestScene, stepScene } from "@/test/fixtures/headlessGame.test";
import { describe, expect, test, vi } from "vitest";

describe(onNextTick, () => {
  const sceneKey = "sceneKey";

  test("fires once on the next step then clears", () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);

    const listener = vi.fn<() => void>();
    onNextTick(listener, sceneKey);
    stepScene(scene, 1);

    expect(listener).toHaveBeenCalledTimes(1);

    stepScene(scene, 1);

    expect(listener).toHaveBeenCalledTimes(1);

    removeTestScene(sceneKey);
  });
});
