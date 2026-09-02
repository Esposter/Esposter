import { getTestGame, removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { sleepScene } from "#src/util/sleepScene";
import { describe, expect, test } from "vitest";

describe(sleepScene, () => {
  const sceneKey = "sceneKey";
  const durationMs = 500;

  // The clock only advances on a game step, which the headless fixture never takes, so the timer here can only be
  // The one the scene's shutdown discards
  test("settles when the scene is stopped mid-wait", async () => {
    expect.hasAssertions();

    const sleep = sleepScene(startTestScene(sceneKey), durationMs);
    getTestGame().scene.stop(sceneKey);

    await expect(sleep).resolves.toBeUndefined();

    removeTestScene(sceneKey);
  });
});
