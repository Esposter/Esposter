import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { Tilemaps } from "phaser";

import Tilemap from "#src/components/Tilemap.vue";
import { startTestScene, stepScene } from "#src/test/fixtures/headlessGame.test";
import { setupGameObjectSuite } from "#src/test/fixtures/setupGameObjectSuite.test";
import { takeOne } from "@esposter/shared";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

describe("tilemap", () => {
  const { mountGameObject, sceneKey, unmountGameObject } = setupGameObjectSuite();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("destroys the old tilemap and fires onComplete with the new one when the key changes", async () => {
    expect.hasAssertions();

    const completedTilemaps: Tilemaps.Tilemap[] = [];

    const wrapper = mountGameObject(Tilemap, {
      props: {
        configuration: {},
        onComplete: (_scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => {
          completedTilemaps.push(tilemap);
        },
      },
    });

    startTestScene(sceneKey);

    const firstTilemap = takeOne(completedTilemaps);
    const destroySpy = vi.spyOn(firstTilemap, "destroy");

    await wrapper.setProps({ configuration: { key: " " } });

    const secondTilemap = takeOne(completedTilemaps, 1);

    expect(destroySpy).toHaveBeenCalledTimes(1);
    expect(secondTilemap).not.toBe(firstTilemap);
  });

  test("destroys the tilemap on unmount", () => {
    expect.hasAssertions();

    let capturedTilemap: Tilemaps.Tilemap | undefined;

    mountGameObject(Tilemap, {
      props: {
        configuration: {},
        onComplete: (_scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => {
          capturedTilemap = tilemap;
        },
      },
    });

    startTestScene(sceneKey);

    assert.exists(capturedTilemap);

    const destroySpy = vi.spyOn(capturedTilemap, "destroy");

    unmountGameObject();

    expect(destroySpy).toHaveBeenCalledTimes(1);
  });

  test("builds the tilemap when it mounts after its scene has created", () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    let capturedTilemap: Tilemaps.Tilemap | undefined;

    mountGameObject(Tilemap, {
      props: {
        configuration: {},
        onComplete: (_scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => {
          capturedTilemap = tilemap;
        },
      },
    });
    stepScene(scene);

    expect(capturedTilemap).toBeDefined();
  });
});
