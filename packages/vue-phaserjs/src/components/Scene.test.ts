import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import Scene from "@/components/Scene.vue";
import { useInputStore } from "@/store/input";
import { getTestGame, getTestPinia, removeTestScene } from "@/test/fixtures/headlessGame.test";
import { mount } from "@vue/test-utils";
import { Cameras } from "phaser";
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
    const scene = game.scene.getScene(sceneKey);
    game.scene.stop(sceneKey);

    expect(shutdownScene).toBe(scene);

    wrapper.unmount();
    removeTestScene(sceneKey);
  });

  test("fADE_OUT_START disables input", () => {
    expect.hasAssertions();

    const sceneKey = "sceneKey";
    const game = getTestGame();
    const wrapper = mount(Scene, {
      global: { plugins: [getTestPinia()] },
      props: { sceneKey },
    });
    game.scene.start(sceneKey);
    const scene = game.scene.getScene(sceneKey);
    const inputStore = useInputStore();
    const { isInputActive } = storeToRefs(inputStore);

    isInputActive.value = true;
    scene.cameras.main.emit(Cameras.Scene2D.Events.FADE_OUT_START);

    expect(isInputActive.value).toBe(false);

    wrapper.unmount();
    removeTestScene(sceneKey);
  });

  test("fADE_IN_START disables input", () => {
    expect.hasAssertions();

    const sceneKey = "sceneKey";
    const game = getTestGame();
    const wrapper = mount(Scene, {
      global: { plugins: [getTestPinia()] },
      props: { sceneKey },
    });
    game.scene.start(sceneKey);
    const scene = game.scene.getScene(sceneKey);
    const inputStore = useInputStore();
    const { isInputActive } = storeToRefs(inputStore);

    isInputActive.value = true;
    scene.cameras.main.emit(Cameras.Scene2D.Events.FADE_IN_START);

    expect(isInputActive.value).toBe(false);

    wrapper.unmount();
    removeTestScene(sceneKey);
  });

  test("fADE_IN_COMPLETE re-enables input", () => {
    expect.hasAssertions();

    const sceneKey = "sceneKey";
    const game = getTestGame();
    const wrapper = mount(Scene, {
      global: { plugins: [getTestPinia()] },
      props: { sceneKey },
    });
    game.scene.start(sceneKey);
    const scene = game.scene.getScene(sceneKey);
    const inputStore = useInputStore();
    const { isInputActive } = storeToRefs(inputStore);

    isInputActive.value = false;
    scene.cameras.main.emit(Cameras.Scene2D.Events.FADE_IN_COMPLETE);

    expect(isInputActive.value).toBe(true);

    wrapper.unmount();
    removeTestScene(sceneKey);
  });
});
