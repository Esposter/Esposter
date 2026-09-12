import { useCameraStore } from "#src/store/camera";
import { getTestPinia, removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { describe, expect, test, vi } from "vitest";

describe(useCameraStore, () => {
  const sceneKey = "sceneKey";
  const durationMs = 500;

  test.each(["fadeIn", "fadeOut"] as const)("%s sets isFading and forwards to the main camera", (fade) => {
    expect.hasAssertions();

    setActivePinia(getTestPinia());

    const cameraStore = useCameraStore();
    const { isFading } = storeToRefs(cameraStore);
    const scene = startTestScene(sceneKey);
    const fadeSpy = vi.spyOn(scene.cameras.main, fade);

    cameraStore[fade](scene, durationMs);

    expect(isFading.value).toBe(true);
    expect(fadeSpy).toHaveBeenCalledWith(durationMs);

    removeTestScene(sceneKey);
  });
});
