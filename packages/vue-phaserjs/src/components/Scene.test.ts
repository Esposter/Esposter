import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import Scene from "@/components/Scene.vue";
import { useCameraStore } from "@/store/camera";
import { useInputStore } from "@/store/input";
import { getTestGame, getTestPinia, removeTestScene } from "@/test/fixtures/headlessGame.test";
import { mount } from "@vue/test-utils";
import { Cameras } from "phaser";
import { afterEach, describe, expect, test } from "vitest";

describe("scene", () => {
  const sceneKey = "sceneKey";
  let wrapper: ReturnType<typeof mount<typeof Scene>> | undefined;

  const mountScene = (props?: Partial<InstanceType<typeof Scene>["$props"]>) => {
    wrapper = mount(Scene, {
      global: { plugins: [getTestPinia()] },
      props: { sceneKey, ...props },
    });
    return wrapper;
  };

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    removeTestScene(sceneKey);
  });

  test("adds the scene to the phaser game after mount", () => {
    expect.hasAssertions();

    const game = getTestGame();
    mountScene();

    expect(game.scene.getScene(sceneKey)).not.toBeNull();
  });

  test("emits init, preload, and create in that order when the scene starts", () => {
    expect.hasAssertions();

    const game = getTestGame();
    const order: string[] = [];
    mountScene({
      onCreate: () => order.push("create"),
      onInit: () => order.push("init"),
      onPreload: () => order.push("preload"),
    });

    game.scene.start(sceneKey);

    expect(order).toStrictEqual(["init", "preload", "create"]);
  });

  test("emits shutdown when the scene is stopped externally", () => {
    expect.hasAssertions();

    const game = getTestGame();
    let shutdownScene: SceneWithPlugins | undefined;
    mountScene({
      onShutdown: (scene: SceneWithPlugins) => {
        shutdownScene = scene;
      },
    });

    game.scene.start(sceneKey);
    const scene = game.scene.getScene(sceneKey);
    game.scene.stop(sceneKey);

    expect(shutdownScene).toBe(scene);
  });

  test("disables input while a camera fade runs and re-enables it on fade in complete", () => {
    expect.hasAssertions();

    const game = getTestGame();
    mountScene();
    game.scene.start(sceneKey);
    const camera = game.scene.getScene(sceneKey).cameras.main;
    const inputStore = useInputStore();
    const { isInputActive } = storeToRefs(inputStore);
    const cameraStore = useCameraStore();
    const { isFading } = storeToRefs(cameraStore);

    camera.emit(Cameras.Scene2D.Events.FADE_IN_START);

    expect(isInputActive.value).toBe(false);

    isFading.value = true;
    camera.emit(Cameras.Scene2D.Events.FADE_IN_COMPLETE);

    expect(isInputActive.value).toBe(true);
    expect(isFading.value).toBe(false);

    camera.emit(Cameras.Scene2D.Events.FADE_OUT_START);

    expect(isInputActive.value).toBe(false);

    isFading.value = true;
    camera.emit(Cameras.Scene2D.Events.FADE_OUT_COMPLETE);

    expect(isInputActive.value).toBe(false);
    expect(isFading.value).toBe(false);
  });
});
