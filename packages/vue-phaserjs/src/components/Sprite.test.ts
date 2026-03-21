import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import Sprite from "@/components/Sprite.vue";
import { getTestPinia, removeTestScene, startTestScene } from "@/test/fixtures/headlessGame.test";
import { InjectionKeyMap } from "@/util/InjectionKeyMap";
import { mount } from "@vue/test-utils";
import { assert, describe, expect, test } from "vitest";

describe("sprite", () => {
  const sceneKey = "sceneKey";

  test("creates a sprite game object with the configured texture", () => {
    expect.hasAssertions();

    let capturedSprite: GameObjects.Sprite | undefined;

    const wrapper = mount(Sprite, {
      global: {
        plugins: [getTestPinia()],
        provide: { [InjectionKeyMap.SceneKey]: sceneKey },
      },
      props: {
        configuration: { texture: "", x: 0, y: 0 },
        onComplete: (_scene: SceneWithPlugins, sprite: GameObjects.Sprite) => {
          capturedSprite = sprite;
        },
      },
    });

    startTestScene(sceneKey);

    assert.exists(capturedSprite);

    expect(capturedSprite.texture.key).toBe("__MISSING");

    wrapper.unmount();
    removeTestScene(sceneKey);
  });

  test("places the sprite on the scene display list", () => {
    expect.hasAssertions();

    let capturedSprite: GameObjects.Sprite | undefined;

    const wrapper = mount(Sprite, {
      global: {
        plugins: [getTestPinia()],
        provide: { [InjectionKeyMap.SceneKey]: sceneKey },
      },
      props: {
        configuration: { texture: "", x: 0, y: 0 },
        onComplete: (_scene: SceneWithPlugins, sprite: GameObjects.Sprite) => {
          capturedSprite = sprite;
        },
      },
    });

    const scene = startTestScene(sceneKey);

    assert.exists(capturedSprite);

    expect(scene.children.list).toContain(capturedSprite);

    wrapper.unmount();
    removeTestScene(sceneKey);
  });
});
