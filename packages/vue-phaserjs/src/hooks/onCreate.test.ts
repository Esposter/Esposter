import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import { onCreate } from "@/hooks/onCreate";
import { removeTestScene, startTestScene } from "@/test/fixtures/headlessGame.test";
import { describe, expect, test, vi } from "vitest";

describe(onCreate, () => {
  const sceneKey = "sceneKey";

  test("fires listener exactly once during create", () => {
    expect.hasAssertions();

    const listener = vi.fn<(scene: SceneWithPlugins) => void>();
    onCreate(listener, sceneKey);
    startTestScene(sceneKey);

    expect(listener).toHaveBeenCalledTimes(1);

    removeTestScene(sceneKey);
  });

  test("sceneA listener does not fire when sceneB starts", () => {
    expect.hasAssertions();

    const sceneKeyA = "sceneKeyA";
    const sceneKeyB = "sceneKeyB";
    const listenerA = vi.fn<(scene: SceneWithPlugins) => void>();
    const listenerB = vi.fn<(scene: SceneWithPlugins) => void>();
    onCreate(listenerA, sceneKeyA);
    onCreate(listenerB, sceneKeyB);

    startTestScene(sceneKeyA);

    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(0);

    startTestScene(sceneKeyB);

    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);

    removeTestScene(sceneKeyA);
    removeTestScene(sceneKeyB);
  });
});
