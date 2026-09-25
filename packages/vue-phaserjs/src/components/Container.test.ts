import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import Container from "#src/components/Container.vue";
import Sprite from "#src/components/Sprite.vue";
import { startTestScene } from "#src/test/fixtures/headlessGame.test";
import { setupGameObjectSuite } from "#src/test/fixtures/setupGameObjectSuite.test";
import { assert, describe, expect, test } from "vitest";
import { h } from "vue";

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
});
