/* eslint-disable vitest/require-top-level-describe */
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import { Lifecycle } from "@/models/lifecycle/Lifecycle";
import { usePhaserStore } from "@/store";
import { ExternalSceneStore } from "@/store/scene";
import { createSceneClass } from "@/util/createSceneClass";
import { resetLifecycleListeners } from "@/util/hooks/resetLifecycleListeners";
import { runLifecycleListeners } from "@/util/hooks/runLifecycleListeners";
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
  const scene = testGame.scene.getScene(key) as SceneWithPlugins;
  const readyListener = () => {
    ExternalSceneStore.sceneReadyMap.set(key, true);
  };
  const shutdownListener = () => {
    resetLifecycleListeners(scene, Lifecycle.Update);
    resetLifecycleListeners(scene, Lifecycle.NextTick);
    runLifecycleListeners(scene, Lifecycle.Shutdown);
    ExternalSceneStore.sceneReadyMap.set(key, false);
  };
  scene.events.on(Scenes.Events.READY, readyListener);
  scene.events.on(Scenes.Events.SHUTDOWN, shutdownListener);
  testGame.scene.start(key);
  return scene;
};
/**
 * Advance the scene N times, firing onUpdate and onNextTick listeners.
 * Calls lifecycle listeners directly rather than going through game.step()
 * because the HEADLESS renderer is null and game.step() calls renderer.preRender().
 */
export const stepScene = (scene: SceneWithPlugins, n = 1): void => {
  for (let i = 0; i < n; i++) {
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
  if (!testGame.isBooted) throw new Error("Phaser game failed to boot synchronously");
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
