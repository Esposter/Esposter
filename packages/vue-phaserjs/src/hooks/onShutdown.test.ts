import { onShutdown } from "@/hooks/onShutdown";
import { getTestGame, removeTestScene, startTestScene } from "@/test/fixtures/headlessGame.test";
import { describe, expect, test, vi } from "vitest";

describe(onShutdown, () => {
  const sceneKey = "sceneKey";

  test("fires on scene shutdown", () => {
    expect.hasAssertions();

    const listener = vi.fn<() => void>();
    onShutdown(listener, sceneKey);
    startTestScene(sceneKey);
    getTestGame().scene.stop(sceneKey);

    expect(listener).toHaveBeenCalledTimes(1);

    removeTestScene(sceneKey);
  });
});
