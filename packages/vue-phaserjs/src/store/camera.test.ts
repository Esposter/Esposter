import { useCameraStore } from "@/store/camera";
import { useInputStore } from "@/store/input";
import { getTestPinia, removeTestScene, startTestScene } from "@/test/fixtures/headlessGame.test";
import { describe, expect, test, vi } from "vitest";

describe(useCameraStore, () => {
  const sceneKey = "sceneKey";

  test("fadeOut sets isFading to true and disables input", () => {
    expect.hasAssertions();

    setActivePinia(getTestPinia());

    const cameraStore = useCameraStore();
    const { isFading } = storeToRefs(cameraStore);
    const { fadeOut } = cameraStore;
    const inputStore = useInputStore();
    const scene = startTestScene(sceneKey);
    const fadeOutSpy = vi.spyOn(scene.cameras.main, "fadeOut");

    inputStore.isInputActive = true;
    fadeOut(scene, 500);

    expect(isFading.value).toBe(true);
    expect(inputStore.isInputActive).toBe(false);
    expect(fadeOutSpy).toHaveBeenCalledWith(500);

    removeTestScene(sceneKey);
  });

  test("fadeIn sets isFading to true and disables input", () => {
    expect.hasAssertions();

    setActivePinia(getTestPinia());

    const cameraStore = useCameraStore();
    const { isFading } = storeToRefs(cameraStore);
    const { fadeIn } = cameraStore;
    const inputStore = useInputStore();
    const scene = startTestScene(sceneKey);
    const fadeInSpy = vi.spyOn(scene.cameras.main, "fadeIn");

    inputStore.isInputActive = true;
    fadeIn(scene, 500);

    expect(isFading.value).toBe(true);
    expect(inputStore.isInputActive).toBe(false);
    expect(fadeInSpy).toHaveBeenCalledWith(500);

    removeTestScene(sceneKey);
  });
});
