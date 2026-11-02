// @vitest-environment nuxt
import { useMicrophoneLevel } from "@/composables/message/user/settings/useMicrophoneLevel";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

class AudioContextStub {
  close = () => Promise.resolve();
  createAnalyser = () => ({ fftSize: 0, getFloatTimeDomainData: () => {} });
  createMediaStreamSource = () => ({ connect: () => {} });
}

describe(useMicrophoneLevel, () => {
  let getUserMedia: ReturnType<typeof vi.fn<(constraints: MediaStreamConstraints) => Promise<MediaStream>>>;
  let resolveRequests: ((stream: MediaStream) => void)[];
  let microphoneLevel: ReturnType<typeof useMicrophoneLevel>;
  let wrapper: Awaited<ReturnType<typeof mountSuspended>>;

  beforeEach(() => {
    resolveRequests = [];
    getUserMedia = vi.fn<(constraints: MediaStreamConstraints) => Promise<MediaStream>>(
      () =>
        new Promise<MediaStream>((resolve) => {
          resolveRequests.push(resolve);
        }),
    );
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia } });
    vi.stubGlobal("AudioContext", AudioContextStub);
  });

  afterEach(() => {
    wrapper.unmount();
    vi.unstubAllGlobals();
  });

  test("a start made while one is pending joins it rather than requesting a second stream", async () => {
    expect.hasAssertions();

    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          microphoneLevel = useMicrophoneLevel();
        },
      }),
    );
    const starting = Promise.all([microphoneLevel.start(), microphoneLevel.start()]);
    await flushPromises();
    for (const resolve of resolveRequests) resolve({ getTracks: () => [] } as unknown as MediaStream);
    await starting;
    await flushPromises();

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(microphoneLevel.isTesting.value).toBe(true);
  });
});
