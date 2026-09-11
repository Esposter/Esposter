import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import Sprite from "#src/components/Sprite.vue";
import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { startTestScene, stepScene } from "#src/test/fixtures/headlessGame.test";
import { setupGameObjectSuite } from "#src/test/fixtures/setupGameObjectSuite.test";
import { assert, describe, expect, test } from "vitest";

describe(useInitializeGameObject, () => {
  const { mountGameObject, sceneKey, unmountGameObject } = setupGameObjectSuite();
  // 0 is the depth a game object already has, so the lowest value that proves a setter ran is 1
  const depth = 1;
  const newDepth = 2;
  const configuration = { texture: "", x: 0, y: 0 };
  const depthConfiguration = { ...configuration, depth };

  test("applies the initial configuration via the SetterMap to the game object on init", () => {
    expect.hasAssertions();

    let capturedSprite: GameObjects.Sprite | undefined;

    mountGameObject(Sprite, {
      props: {
        configuration: depthConfiguration,
        onComplete: (_scene: SceneWithPlugins, sprite: GameObjects.Sprite) => {
          capturedSprite = sprite;
        },
      },
    });

    startTestScene(sceneKey);

    assert.exists(capturedSprite);

    expect(capturedSprite.depth).toBe(depth);
  });

  test("calls the Phaser setter and reflects the new value when a configuration property changes", async () => {
    expect.hasAssertions();

    let capturedSprite: GameObjects.Sprite | undefined;

    const wrapper = mountGameObject(Sprite, {
      props: {
        configuration: depthConfiguration,
        onComplete: (_scene: SceneWithPlugins, sprite: GameObjects.Sprite) => {
          capturedSprite = sprite;
        },
      },
    });

    const scene = startTestScene(sceneKey);
    assert.exists(capturedSprite);

    await wrapper.setProps({ configuration: { ...configuration, depth: newDepth } });
    stepScene(scene);

    expect(capturedSprite.depth).toBe(newDepth);
  });

  test("leaves a value written outside the configuration alone when a re-render passes an equal configuration", async () => {
    expect.hasAssertions();

    let capturedSprite: GameObjects.Sprite | undefined;

    const wrapper = mountGameObject(Sprite, {
      props: {
        configuration: depthConfiguration,
        onComplete: (_scene: SceneWithPlugins, sprite: GameObjects.Sprite) => {
          capturedSprite = sprite;
        },
      },
    });

    const scene = startTestScene(sceneKey);
    assert.exists(capturedSprite);

    // Whatever drives the game object between renders, e.g. an animation plugin writing frames
    capturedSprite.setDepth(newDepth);
    await wrapper.setProps({ configuration: { ...depthConfiguration } });
    stepScene(scene);

    expect(capturedSprite.depth).toBe(newDepth);
  });

  test("destroys the game object and removes it from the scene display list on unmount", () => {
    expect.hasAssertions();

    let capturedSprite: GameObjects.Sprite | undefined;

    mountGameObject(Sprite, {
      props: {
        configuration,
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
        configuration,
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
