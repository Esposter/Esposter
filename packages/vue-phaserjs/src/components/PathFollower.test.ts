import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import PathFollower from "@/components/PathFollower.vue";
import { getTestPinia, removeTestScene, startTestScene } from "@/test/fixtures/headlessGame.test";
import { InjectionKeyMap } from "@/util/InjectionKeyMap";
import { mount } from "@vue/test-utils";
import { Curves } from "phaser";
import { assert, describe, expect, test } from "vitest";

describe("pathFollower", () => {
  const sceneKey = "sceneKey";

  test("creates a path follower game object with the configured path and texture", () => {
    expect.hasAssertions();

    const path = new Curves.Path(0, 0);
    let capturedFollower: GameObjects.PathFollower | undefined;

    const wrapper = mount(PathFollower, {
      global: {
        plugins: [getTestPinia()],
        provide: { [InjectionKeyMap.SceneKey]: sceneKey },
      },
      props: {
        configuration: { path, texture: "" },
        onComplete: (_scene: SceneWithPlugins, follower: GameObjects.PathFollower) => {
          capturedFollower = follower;
        },
      },
    });

    startTestScene(sceneKey);

    assert.exists(capturedFollower);

    expect(capturedFollower.texture.key).toBe("__MISSING");

    wrapper.unmount();
    removeTestScene(sceneKey);
  });

  test("places the path follower on the scene display list", () => {
    expect.hasAssertions();

    const path = new Curves.Path(0, 0);
    let capturedFollower: GameObjects.PathFollower | undefined;

    const wrapper = mount(PathFollower, {
      global: {
        plugins: [getTestPinia()],
        provide: { [InjectionKeyMap.SceneKey]: sceneKey },
      },
      props: {
        configuration: { path, texture: "" },
        onComplete: (_scene: SceneWithPlugins, follower: GameObjects.PathFollower) => {
          capturedFollower = follower;
        },
      },
    });

    const scene = startTestScene(sceneKey);

    assert.exists(capturedFollower);

    expect(scene.children.list).toContain(capturedFollower);

    wrapper.unmount();
    removeTestScene(sceneKey);
  });
});
