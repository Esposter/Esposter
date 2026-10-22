import { waitForNextTick } from "#src/services/shared/waitForNextTick";
import { getTestGame, removeTestScene, startTestScene, stepScene } from "#src/test/fixtures/headlessGame.test";
import { afterEach, describe, expect, test } from "vitest";

describe(waitForNextTick, () => {
  const sceneKey = "sceneKey";

  afterEach(() => {
    removeTestScene(sceneKey);
  });

  test("settles on the scene's next step", async () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    const wait = waitForNextTick(scene);
    stepScene(scene, 1);

    await expect(wait).resolves.toBeUndefined();
  });

  // The scene drops its next-tick listeners when it shuts down, so without the shutdown settlement this wait never ends
  test("settles when the scene shuts down before its next step", async () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    const wait = waitForNextTick(scene);
    getTestGame().scene.stop(sceneKey);

    await expect(wait).resolves.toBeUndefined();
  });

  test("resolves at once for a scene that has already shut down", async () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    getTestGame().scene.stop(sceneKey);

    await expect(waitForNextTick(scene)).resolves.toBeUndefined();
  });
});
