import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import Sprite from "@/components/Sprite.vue";
import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { startTestScene, stepScene } from "@/test/fixtures/headlessGame.test";
import { setupGameObjectSuite } from "@/test/fixtures/setupGameObjectSuite.test";
import { assert, describe, expect, test } from "vitest";

describe(useInitializeGameObject, () => {
  const { mountGameObject, sceneKey, unmountGameObject } = setupGameObjectSuite();

  test("applies the initial configuration via the SetterMap to the game object on init", () => {
    expect.hasAssertions();

    let capturedSprite: GameObjects.Sprite | undefined;

    mountGameObject(Sprite, {
      props: {
        configuration: { depth: 5, texture: "", x: 0, y: 0 },
        onComplete: (_scene: SceneWithPlugins, sprite: GameObjects.Sprite) => {
          capturedSprite = sprite;
        },
      },
    });

    startTestScene(sceneKey);

    assert.exists(capturedSprite);

    expect(capturedSprite.depth).toBe(5);
  });

  test("calls the Phaser setter and reflects the new value when a configuration property changes", async () => {
    expect.hasAssertions();

    let capturedSprite: GameObjects.Sprite | undefined;

    const wrapper = mountGameObject(Sprite, {
      props: {
        configuration: { depth: 5, texture: "", x: 0, y: 0 },
        onComplete: (_scene: SceneWithPlugins, sprite: GameObjects.Sprite) => {
          capturedSprite = sprite;
        },
      },
    });

    const scene = startTestScene(sceneKey);
    assert.exists(capturedSprite);

    await wrapper.setProps({ configuration: { depth: 10, texture: "", x: 0, y: 0 } });
    stepScene(scene);

    expect(capturedSprite.depth).toBe(10);
  });

  test("destroys the game object and removes it from the scene display list on unmount", () => {
    expect.hasAssertions();

    let capturedSprite: GameObjects.Sprite | undefined;

    mountGameObject(Sprite, {
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

    unmountGameObject();

    expect(scene.children.list).not.toContain(capturedSprite);
  });

  test("creates the game object immediately without waiting for onCreate when the immediate flag is set", () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);

    let capturedSprite: GameObjects.Sprite | undefined;

    mountGameObject(Sprite, {
      props: {
        configuration: { texture: "", x: 0, y: 0 },
        immediate: true,
        onComplete: (_scene: SceneWithPlugins, sprite: GameObjects.Sprite) => {
          capturedSprite = sprite;
        },
      },
    });

    assert.exists(capturedSprite);

    expect(scene.children.list).toContain(capturedSprite);
  });
});
