import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { onShutdown } from "#src/hooks/onShutdown";
import { onUpdate } from "#src/hooks/onUpdate";
import { pushListener } from "#src/services/hooks/pushListener";
import { getTestGame, removeTestScene, startTestScene, stepScene } from "#src/test/fixtures/headlessGame.test";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(pushListener, () => {
  const sceneKey = "sceneKey";

  afterEach(() => {
    removeTestScene(sceneKey);
  });

  test("stops an update listener a component registered once the component unmounts", () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    const listener = vi.fn<(scene: SceneWithPlugins) => void>();
    const wrapper = mount({
      setup: () => {
        onUpdate(listener, sceneKey);
        return () => null;
      },
    });

    stepScene(scene);
    wrapper.unmount();
    stepScene(scene);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("keeps a shutdown listener a component registered until its scene shuts down", () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    const listener = vi.fn<(scene: SceneWithPlugins) => void>();
    const wrapper = mount({
      setup: () => {
        onShutdown(listener, sceneKey);
        return () => null;
      },
    });

    wrapper.unmount();
    getTestGame().scene.stop(sceneKey);

    expect(listener).toHaveBeenCalledExactlyOnceWith(scene);
  });
});
