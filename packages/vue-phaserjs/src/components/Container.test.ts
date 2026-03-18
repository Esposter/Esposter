import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import Container from "@/components/Container.vue";
import Sprite from "@/components/Sprite.vue";
import { getTestPinia, removeTestScene, startTestScene } from "@/test/fixtures/headlessGame.test";
import { InjectionKeyMap } from "@/util/InjectionKeyMap";
import { mount } from "@vue/test-utils";
import { GameObjects } from "phaser";
import { assert, describe, expect, test } from "vitest";
import { h } from "vue";

describe("container", () => {
  const sceneKey = "sceneKey";

  test("child sprite is placed inside the phaser container", () => {
    expect.hasAssertions();

    let capturedSprite: GameObjects.Sprite | undefined;

    const wrapper = mount(Container, {
      global: {
        plugins: [getTestPinia()],
        provide: { [InjectionKeyMap.SceneKey]: sceneKey },
      },
      slots: {
        default: () =>
          h(Sprite, {
            configuration: { texture: "", x: 0, y: 0 },
            onComplete: (_scene: SceneWithPlugins, sprite: GameObjects.Sprite) => {
              capturedSprite = sprite;
            },
          }),
      },
    });

    startTestScene(sceneKey);

    assert.exists(capturedSprite);

    expect(capturedSprite.parentContainer).not.toBeNull();

    wrapper.unmount();
    removeTestScene(sceneKey);
  });

  test("container is placed on the scene display list", () => {
    expect.hasAssertions();

    const wrapper = mount(Container, {
      global: {
        plugins: [getTestPinia()],
        provide: { [InjectionKeyMap.SceneKey]: sceneKey },
      },
      slots: {
        default: () =>
          h(Sprite, {
            configuration: { texture: "", x: 0, y: 0 },
          }),
      },
    });

    const scene = startTestScene(sceneKey);
    const container = scene.children.list.find((obj) => obj instanceof GameObjects.Container);

    assert.exists(container);

    wrapper.unmount();
    removeTestScene(sceneKey);
  });
});
