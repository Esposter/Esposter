import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import { onPreload } from "@/hooks/onPreload";
import { removeTestScene, startTestScene } from "@/test/fixtures/headlessGame.test";
import { describe, expect, test, vi } from "vitest";

describe(onPreload, () => {
  const sceneKey = "sceneKey";

  test("fires listener during preload", () => {
    expect.hasAssertions();

    const listener = vi.fn<(scene: SceneWithPlugins) => void>();
    onPreload(listener, sceneKey);
    startTestScene(sceneKey);

    expect(listener).toHaveBeenCalledTimes(1);

    removeTestScene(sceneKey);
  });
});
