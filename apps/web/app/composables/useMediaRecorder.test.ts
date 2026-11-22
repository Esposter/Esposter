// @vitest-environment happy-dom
import { useMediaRecorder } from "#src/composables/useMediaRecorder";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useMediaRecorder, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // The device is still being asked for, so there is no recorder to read a state from. A second start must wait for the
  // First rather than open a second stream
  test("a start made while the first still waits on the device asks for no second stream", () => {
    expect.hasAssertions();

    const getUserMedia = vi.fn<() => Promise<MediaStream>>(() => new Promise<MediaStream>(() => {}));
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia } });
    const { start } = useMediaRecorder();
    const starts = [start(), start()];

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(starts).toHaveLength(2);

    Reflect.deleteProperty(navigator, "mediaDevices");
  });
});
