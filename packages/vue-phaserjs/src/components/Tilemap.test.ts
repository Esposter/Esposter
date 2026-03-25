import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { Tilemaps } from "phaser";

import Tilemap from "@/components/Tilemap.vue";
import { getTestPinia, removeTestScene, startTestScene } from "@/test/fixtures/headlessGame.test";
import { InjectionKeyMap } from "@/util/InjectionKeyMap";
import { takeOne } from "@esposter/shared";
import { mount } from "@vue/test-utils";
import { assert, describe, expect, test, vi } from "vitest";

describe("tilemap", () => {
  const sceneKey = "sceneKey";

  test("destroys the old tilemap and fires onComplete with the new one when the key changes", async () => {
    expect.hasAssertions();

    const completedTilemaps: Tilemaps.Tilemap[] = [];

    const wrapper = mount(Tilemap, {
      global: {
        plugins: [getTestPinia()],
        provide: { [InjectionKeyMap.SceneKey]: sceneKey },
      },
      props: {
        configuration: {},
        onComplete: (_scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => {
          completedTilemaps.push(tilemap);
        },
      },
    });

    startTestScene(sceneKey);

    const firstTilemap = takeOne(completedTilemaps, 0);
    const destroySpy = vi.spyOn(firstTilemap, "destroy");

    await wrapper.setProps({ configuration: { key: " " } });

    const secondTilemap = takeOne(completedTilemaps, 1);

    expect(destroySpy).toHaveBeenCalledTimes(1);
    expect(secondTilemap).not.toBe(firstTilemap);

    wrapper.unmount();
    removeTestScene(sceneKey);
  });

  test("destroys the tilemap on unmount", () => {
    expect.hasAssertions();

    let capturedTilemap: Tilemaps.Tilemap | undefined;

    const wrapper = mount(Tilemap, {
      global: {
        plugins: [getTestPinia()],
        provide: { [InjectionKeyMap.SceneKey]: sceneKey },
      },
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

    wrapper.unmount();

    expect(destroySpy).toHaveBeenCalledTimes(1);

    removeTestScene(sceneKey);
  });
});
