import { useCameraStore } from "@/store/camera";
import { getTestPinia, removeTestScene, startTestScene } from "@/test/fixtures/headlessGame.test";
import { describe, expect, test, vi } from "vitest";

describe(useCameraStore, () => {
  const sceneKey = "sceneKey";

  test("fadeOut sets isFading to true", () => {
    expect.hasAssertions();

    setActivePinia(getTestPinia());

    const cameraStore = useCameraStore();
    const { isFading } = storeToRefs(cameraStore);
    const { fadeOut } = cameraStore;
    const scene = startTestScene(sceneKey);
    const fadeOutSpy = vi.spyOn(scene.cameras.main, "fadeOut");

    fadeOut(scene, 500);

    expect(isFading.value).toBe(true);
    expect(fadeOutSpy).toHaveBeenCalledWith(500);

    removeTestScene(sceneKey);
  });

  test("fadeIn sets isFading to true", () => {
    expect.hasAssertions();

    setActivePinia(getTestPinia());

    const cameraStore = useCameraStore();
    const { isFading } = storeToRefs(cameraStore);
    const { fadeIn } = cameraStore;
    const scene = startTestScene(sceneKey);
    const fadeInSpy = vi.spyOn(scene.cameras.main, "fadeIn");

    fadeIn(scene, 500);

    expect(isFading.value).toBe(true);
    expect(fadeInSpy).toHaveBeenCalledWith(500);

    removeTestScene(sceneKey);
  });
});
