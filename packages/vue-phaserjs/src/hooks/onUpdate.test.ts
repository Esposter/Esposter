import { onUpdate } from "@/hooks/onUpdate";
import { removeTestScene, startTestScene, stepScene } from "@/test/fixtures/headlessGame.test";
import { describe, expect, test, vi } from "vitest";

describe(onUpdate, () => {
  const sceneKey = "sceneKey";

  test("fires listener on each step", () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    const listener = vi.fn<() => void>();
    onUpdate(listener, sceneKey);

    stepScene(scene, 3);

    expect(listener).toHaveBeenCalledTimes(3);

    removeTestScene(sceneKey);
  });
});
