/* eslint-disable vitest/require-top-level-describe */
// oxlint-disable unicorn/no-this-assignment
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import { Lifecycle } from "@/models/lifecycle/Lifecycle";
import { usePhaserStore } from "@/store";
import { ExternalSceneStore } from "@/store/scene";
import { runLifecycleListeners } from "@/util/hooks/runLifecycleListeners";
import { expectToBeDefined } from "@esposter/shared";
import { Game, HEADLESS, Scene } from "phaser";
import { createPinia, setActivePinia } from "pinia";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

let testPinia: ReturnType<typeof createPinia>;
// Exported as a getter so we can assign in beforeAll without a mutable export binding.
export const getTestPinia = (): ReturnType<typeof createPinia> => testPinia;

let game: Game;

export const startTestScene = (key: string): SceneWithPlugins => {
  let capturedScene: SceneWithPlugins | undefined;

  const TestScene = class extends Scene {
    constructor() {
      super({ key });
    }

    create(this: SceneWithPlugins) {
      runLifecycleListeners(this, Lifecycle.Create);
      ExternalSceneStore.sceneReadyMap.set(key, true);
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      capturedScene = this;
    }
  };

  game.scene.add(key, TestScene, true);

  if (!capturedScene) throw new Error(`Scene "${key}" did not reach create()`);

  return capturedScene;
};

beforeAll(() => {
  const app = createApp({});
  testPinia = createPinia();
  app.use(testPinia);
  setActivePinia(testPinia);

  game = new Game({
    audio: { noAudio: true },
    scene: [],
    type: HEADLESS,
  });

  // Document.readyState is stubbed to 'complete' in setupCanvas.ts so Phaser boots
  // Synchronously inside the constructor — check isBooted instead of waiting for 'ready'
  if (!game.isBooted) throw new Error("Phaser game failed to boot synchronously");

  // Stop the automatic Request Animation Frame (RAF) loop — the browser API that drives
  // Phaser's game loop — so it never fires game.step() unexpectedly during tests.
  game.loop.sleep();

  const store = usePhaserStore();
  const { game: gameRef } = storeToRefs(store);
  gameRef.value = game;
});

afterAll(() => {
  game.destroy(true);
});

describe("headlessGame", () => {
  test("creates a headless game", () => {
    expect.hasAssertions();

    expectToBeDefined(game);
  });
});
