import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import Container from "#src/components/Container.vue";
import Sprite from "#src/components/Sprite.vue";
import { startTestScene, stepScene } from "#src/test/fixtures/headlessGame.test";
import { setupGameObjectSuite } from "#src/test/fixtures/setupGameObjectSuite.test";
import { assert, describe, expect, test } from "vitest";
import { h, nextTick, ref } from "vue";

describe("container", () => {
  const { mountGameObject, sceneKey } = setupGameObjectSuite();

  // Phaser matches game objects by identity, so the container a child joins has to be the one the scene displays
  // Rather than a reactive proxy wrapped around it
  test("child sprite is placed inside the phaser container the scene displays", () => {
    expect.hasAssertions();

    let capturedSprite: GameObjects.Sprite | undefined;

    mountGameObject(Container, {
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

    const scene = startTestScene(sceneKey);

    assert.exists(capturedSprite);

    expect(scene.children.list).toContain(capturedSprite.parentContainer);
  });

  test("does not place an immediate child that unmounted before its scene's next tick", async () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    const isChildVisible = ref(true);
    let capturedSprite: GameObjects.Sprite | undefined;
    let capturedContainer: GameObjects.Container | undefined;

    mountGameObject(Container, {
      props: {
        onComplete: (_scene: SceneWithPlugins, container: GameObjects.Container) => {
          capturedContainer = container;
        },
      },
      slots: {
        default: () =>
          isChildVisible.value
            ? [
                h(Sprite, {
                  configuration: { texture: "", x: 0, y: 0 },
                  immediate: true,
                  onComplete: (_scene: SceneWithPlugins, sprite: GameObjects.Sprite) => {
                    capturedSprite = sprite;
                  },
                }),
              ]
            : [],
      },
    });
    assert.exists(capturedSprite);

    isChildVisible.value = false;
    await nextTick();
    stepScene(scene);

    assert.exists(capturedContainer);

    expect(capturedContainer.list).not.toContain(capturedSprite);
  });
});
