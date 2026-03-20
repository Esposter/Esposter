import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import Scene from "@/components/Scene.vue";
import { getTestGame, getTestPinia, removeTestScene } from "@/test/fixtures/headlessGame.test";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("scene", () => {
  test("adds the scene to the phaser game after mount", () => {
    expect.hasAssertions();

    const sceneKey = "sceneKey";
    const game = getTestGame();

    const wrapper = mount(Scene, {
      global: { plugins: [getTestPinia()] },
      props: { sceneKey },
    });

    expect(game.scene.getScene(sceneKey)).not.toBeNull();

    wrapper.unmount();
    removeTestScene(sceneKey);
  });

  test("emits init, preload, and create in that order when the scene starts", () => {
    expect.hasAssertions();

    const sceneKey = "sceneKey";
    const game = getTestGame();
    const order: string[] = [];

    const wrapper = mount(Scene, {
      global: { plugins: [getTestPinia()] },
      props: {
        onCreate: () => order.push("create"),
        onInit: () => order.push("init"),
        onPreload: () => order.push("preload"),
        sceneKey,
      },
    });

    game.scene.start(sceneKey);

    expect(order).toStrictEqual(["init", "preload", "create"]);

    wrapper.unmount();
    removeTestScene(sceneKey);
  });

  test("emits shutdown when the scene is stopped externally", () => {
    expect.hasAssertions();

    const sceneKey = "sceneKey";
    const game = getTestGame();
    let shutdownScene: SceneWithPlugins | undefined;

    const wrapper = mount(Scene, {
      global: { plugins: [getTestPinia()] },
      props: {
        onShutdown: (scene: SceneWithPlugins) => {
          shutdownScene = scene;
        },
        sceneKey,
      },
    });

    game.scene.start(sceneKey);
    const scene = game.scene.getScene(sceneKey) as SceneWithPlugins;
    game.scene.stop(sceneKey);

    expect(shutdownScene).toBe(scene);

    wrapper.unmount();
    removeTestScene(sceneKey);
  });
});
