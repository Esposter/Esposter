import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import Container from "@/components/Container.vue";
import Sprite from "@/components/Sprite.vue";
import { startTestScene } from "@/test/fixtures/headlessGame.test";
import { setupGameObjectSuite } from "@/test/fixtures/setupGameObjectSuite.test";
import { GameObjects } from "phaser";
import { assert, describe, expect, test } from "vitest";
import { h } from "vue";

describe("container", () => {
  const { mountGameObject, sceneKey } = setupGameObjectSuite();

  test("child sprite is placed inside the phaser container", () => {
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

    startTestScene(sceneKey);

    assert.exists(capturedSprite);

    expect(capturedSprite.parentContainer).not.toBeNull();
  });
});
