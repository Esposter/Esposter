import { usePhaserStore } from "@/store";
import { getTestGame, getTestPinia, removeTestScene, startTestScene } from "@/test/fixtures/headlessGame.test";
import { createSceneClass } from "@/util/createSceneClass";
import { describe, expect, test, vi } from "vitest";

describe(usePhaserStore, () => {
  test("switchToScene updates rootSceneKey, stops the old scene, and starts the new scene", async () => {
    expect.hasAssertions();

    setActivePinia(getTestPinia());
    const phaserStore = usePhaserStore();
    const { switchToScene } = phaserStore;
    const { rootSceneKey } = storeToRefs(phaserStore);
    const game = getTestGame();

    startTestScene("sceneA");
    rootSceneKey.value = "sceneA";

    const SceneB = createSceneClass("sceneB");
    game.scene.add("sceneB", SceneB, false);

    const stopSpy = vi.spyOn(game.scene, "stop");
    const startSpy = vi.spyOn(game.scene, "start");

    await switchToScene("sceneB");

    expect(rootSceneKey.value).toBe("sceneB");
    expect(stopSpy).toHaveBeenCalledWith("sceneA");
    expect(startSpy).toHaveBeenCalledWith("sceneB");

    stopSpy.mockRestore();
    startSpy.mockRestore();

    removeTestScene("sceneA");
    removeTestScene("sceneB");
  });

  test("launchParallelScene adds the scene key to parallelSceneKeys and launches the scene", () => {
    expect.hasAssertions();

    setActivePinia(getTestPinia());
    const phaserStore = usePhaserStore();
    const { launchParallelScene } = phaserStore;
    const { parallelSceneKeys } = storeToRefs(phaserStore);
    const game = getTestGame();

    const rootScene = startTestScene("rootScene");
    const ParallelSceneClass = createSceneClass("parallelScene");
    game.scene.add("parallelScene", ParallelSceneClass, false);

    const launchSpy = vi.spyOn(rootScene.scene, "launch");

    launchParallelScene(rootScene, "parallelScene");

    expect(parallelSceneKeys.value).toContain("parallelScene");
    expect(launchSpy).toHaveBeenCalledWith("parallelScene");

    launchSpy.mockRestore();

    parallelSceneKeys.value = [];
    removeTestScene("rootScene");
    removeTestScene("parallelScene");
  });

  test("removeParallelScene removes the scene key from parallelSceneKeys and stops the scene", () => {
    expect.hasAssertions();

    setActivePinia(getTestPinia());
    const phaserStore = usePhaserStore();
    const { launchParallelScene, removeParallelScene } = phaserStore;
    const { parallelSceneKeys } = storeToRefs(phaserStore);
    const game = getTestGame();

    const rootScene = startTestScene("rootScene");
    const ParallelSceneClass = createSceneClass("parallelScene");
    game.scene.add("parallelScene", ParallelSceneClass, false);

    launchParallelScene(rootScene, "parallelScene");

    const stopSpy = vi.spyOn(rootScene.scene, "stop");

    removeParallelScene(rootScene, "parallelScene");

    expect(parallelSceneKeys.value).not.toContain("parallelScene");
    expect(stopSpy).toHaveBeenCalledWith("parallelScene");

    stopSpy.mockRestore();

    removeTestScene("rootScene");
    removeTestScene("parallelScene");
  });
});
