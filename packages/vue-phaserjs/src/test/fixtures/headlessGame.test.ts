import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { Lifecycle } from "#src/models/lifecycle/Lifecycle";
import { runLifecycleListeners } from "#src/services/hooks/runLifecycleListeners";
import { runSceneShutdown } from "#src/services/hooks/runSceneShutdown";
import { createSceneClass } from "#src/services/shared/createSceneClass";
import { usePhaserStore } from "#src/store/index";
import { ExternalSceneStore } from "#src/store/scene";
import { NotInitializedError } from "@esposter/shared";
import { Game, HEADLESS, Scenes } from "phaser";
import { createPinia, setActivePinia } from "pinia";
import { afterAll, beforeAll, describe } from "vitest";

let testPinia: ReturnType<typeof createPinia>;
export const getTestPinia = (): ReturnType<typeof createPinia> => testPinia;
let testGame: Game;
export const getTestGame = (): Game => testGame;

export const startTestScene = (key: string): SceneWithPlugins => {
  const Scene = createSceneClass(key);
  // Add without autoStart so READY/SHUTDOWN listeners are in place before the scene boots.
  testGame.scene.add(key, Scene, false);
  const scene = testGame.scene.getScene(key);
  const readyListener = () => {
    ExternalSceneStore.sceneReadyMap.set(key, true);
  };
  const shutdownListener = () => {
    runSceneShutdown(scene);
  };
  scene.events.on(Scenes.Events.READY, readyListener);
  scene.events.on(Scenes.Events.SHUTDOWN, shutdownListener);
  testGame.scene.start(key);
  return scene;
};
// Advances the scene by firing its onUpdate and onNextTick listeners directly: the HEADLESS renderer is null, so
// Game.step() would fall over in renderer.preRender()
export const stepScene = (scene: SceneWithPlugins, steps = 1): void => {
  for (let step = 0; step < steps; step++) {
    runLifecycleListeners(scene, Lifecycle.Update, false);
    runLifecycleListeners(scene, Lifecycle.NextTick);
  }
};

export const removeTestScene = (key: string): void => {
  if (testGame.scene.getScene(key)) testGame.scene.remove(key);
  for (const listenersMap of ExternalSceneStore.lifecycleListenersMap.values()) listenersMap.delete(key);
  ExternalSceneStore.sceneReadyMap.delete(key);
};

beforeAll(() => {
  const app = createApp({});
  testPinia = createPinia();
  app.use(testPinia);
  setActivePinia(testPinia);
  testGame = new Game({
    audio: { noAudio: true },
    scene: [],
    type: HEADLESS,
  });
  // Document.readyState is stubbed to 'complete' in setupCanvas.ts so Phaser boots
  // Synchronously inside the constructor — check isBooted instead of waiting for 'ready'
  if (!testGame.isBooted) throw new NotInitializedError(Game.name);
  // Stop the automatic Request Animation Frame (RAF) loop — the browser API that drives
  // Phaser's game loop — so it never fires testGame.step() unexpectedly during tests.
  testGame.loop.sleep();

  const phaserStore = usePhaserStore();
  const { game } = storeToRefs(phaserStore);
  game.value = testGame;
});

afterAll(() => {
  testGame.destroy(true);
});

describe.todo("headlessGame");
