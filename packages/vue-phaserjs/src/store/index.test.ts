import { createSceneClass } from "#src/services/shared/createSceneClass";
import { usePhaserStore } from "#src/store/index";
import { getTestGame, getTestPinia, removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { describe, expect, test, vi } from "vitest";

describe(usePhaserStore, () => {
  const sceneKey = "sceneKey";
  const otherSceneKey = "otherSceneKey";

  test("switchToScene updates rootSceneKey, stops the old scene, and starts the new scene", async () => {
    expect.hasAssertions();

    setActivePinia(getTestPinia());
    const phaserStore = usePhaserStore();
    const { switchToScene } = phaserStore;
    const { rootSceneKey } = storeToRefs(phaserStore);
    const game = getTestGame();

    startTestScene(sceneKey);
    rootSceneKey.value = sceneKey;

    const OtherScene = createSceneClass(otherSceneKey);
    game.scene.add(otherSceneKey, OtherScene, false);

    const stopSpy = vi.spyOn(game.scene, "stop");
    const startSpy = vi.spyOn(game.scene, "start");

    await switchToScene(otherSceneKey);

    expect(rootSceneKey.value).toBe(otherSceneKey);
    expect(stopSpy).toHaveBeenCalledWith(sceneKey);
    expect(startSpy).toHaveBeenCalledWith(otherSceneKey);

    stopSpy.mockRestore();
    startSpy.mockRestore();

    removeTestScene(sceneKey);
    removeTestScene(otherSceneKey);
  });

  test("launchParallelScene adds the scene key to parallelSceneKeys and launches the scene", () => {
    expect.hasAssertions();

    setActivePinia(getTestPinia());
    const phaserStore = usePhaserStore();
    const { launchParallelScene } = phaserStore;
    const { parallelSceneKeys } = storeToRefs(phaserStore);
    const game = getTestGame();

    const rootScene = startTestScene(sceneKey);
    const ParallelScene = createSceneClass(otherSceneKey);
    game.scene.add(otherSceneKey, ParallelScene, false);

    const launchSpy = vi.spyOn(rootScene.scene, "launch");

    launchParallelScene(rootScene, otherSceneKey);

    expect(parallelSceneKeys.value).toStrictEqual([otherSceneKey]);
    expect(launchSpy).toHaveBeenCalledWith(otherSceneKey);

    launchSpy.mockRestore();

    parallelSceneKeys.value = [];
    removeTestScene(sceneKey);
    removeTestScene(otherSceneKey);
  });

  test("removeParallelScene removes the scene key from parallelSceneKeys and stops the scene", () => {
    expect.hasAssertions();

    setActivePinia(getTestPinia());
    const phaserStore = usePhaserStore();
    const { launchParallelScene, removeParallelScene } = phaserStore;
    const { parallelSceneKeys } = storeToRefs(phaserStore);
    const game = getTestGame();

    const rootScene = startTestScene(sceneKey);
    const ParallelScene = createSceneClass(otherSceneKey);
    game.scene.add(otherSceneKey, ParallelScene, false);

    launchParallelScene(rootScene, otherSceneKey);

    const stopSpy = vi.spyOn(rootScene.scene, "stop");

    removeParallelScene(rootScene, otherSceneKey);

    expect(parallelSceneKeys.value).toStrictEqual([]);
    expect(stopSpy).toHaveBeenCalledWith(otherSceneKey);

    stopSpy.mockRestore();

    removeTestScene(sceneKey);
    removeTestScene(otherSceneKey);
  });
});
