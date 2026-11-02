import { VideoSetter } from "#src/models/setterMap/VideoSetter";
import { VideoSetterMap } from "#src/services/setterMap/VideoSetterMap";
import { removeTestScene, startTestScene } from "#src/test/fixtures/headlessGame.test";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

describe("videoSetterMap", () => {
  const sceneKey = "sceneKey";

  afterEach(() => {
    removeTestScene(sceneKey);
  });

  test("an undefined muted value leaves the video unmuted", () => {
    expect.hasAssertions();

    const scene = startTestScene(sceneKey);
    const video = scene.add.video(0, 0, "");
    const emit = vi.fn<(...args: unknown[]) => void>();
    const setMuted = VideoSetterMap[VideoSetter.Muted];
    assert.exists(setMuted);
    setMuted(video, emit)(undefined);

    expect(video.isMuted()).toBe(false);
  });
});
