// @vitest-environment nuxt
import { useMicrophoneLevel } from "#src/composables/message/user/settings/useMicrophoneLevel";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The stream a granted request resolves to, holding the tracks the composable stops
const createStream = (tracks: { stop: () => void }[] = []) => ({ getTracks: () => tracks }) as unknown as MediaStream;

describe(useMicrophoneLevel, () => {
  let releaseCloses: (() => void)[];
  class AudioContextStub {
    // A close stays pending until the test releases it, so a stop() can land while a restart is still closing
    close = () =>
      new Promise<void>((resolve) => {
        releaseCloses.push(resolve);
      });
    createAnalyser = () => ({ fftSize: 0, getFloatTimeDomainData: () => {} });
    createMediaStreamSource = () => ({ connect: () => {} });
  }
  let getUserMedia: ReturnType<typeof vi.fn<(constraints: MediaStreamConstraints) => Promise<MediaStream>>>;
  let resolveRequests: ((stream: MediaStream) => void)[];
  let microphoneLevel: ReturnType<typeof useMicrophoneLevel>;
  let secondMicrophoneLevel: ReturnType<typeof useMicrophoneLevel>;
  let wrapper: Awaited<ReturnType<typeof mountSuspended>>;

  const mountMicrophoneLevel = () =>
    mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          microphoneLevel = useMicrophoneLevel();
        },
      }),
    );

  beforeEach(() => {
    resolveRequests = [];
    releaseCloses = [];
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
    // The unmount's stop closes the context, and a close stays pending until released, so every one is released here
    // Before the shared setup drains the stop
    for (const releaseClose of releaseCloses) releaseClose();
    vi.unstubAllGlobals();
  });

  test("a start made while one is pending joins it rather than requesting a second stream", async () => {
    expect.hasAssertions();

    wrapper = await mountMicrophoneLevel();
    const starting = Promise.all([microphoneLevel.start(), microphoneLevel.start()]);
    await flushPromises();
    for (const resolve of resolveRequests) resolve(createStream());
    await starting;
    await flushPromises();

    expect(getUserMedia).toHaveBeenCalledExactlyOnceWith({ audio: {}, video: false });
    expect(microphoneLevel.isTesting.value).toBe(true);
  });

  test("a stop that lands while a restart closes the context it replaces leaves the test stopped", async () => {
    expect.hasAssertions();

    wrapper = await mountMicrophoneLevel();
    const starting = microphoneLevel.start();
    await flushPromises();
    for (const resolve of resolveRequests) resolve(createStream());
    await starting;
    await flushPromises();
    expect(microphoneLevel.isTesting.value).toBe(true);

    resolveRequests = [];
    const restarting = microphoneLevel.start();
    await flushPromises();
    for (const resolve of resolveRequests) resolve(createStream());
    const stopping = microphoneLevel.stop();
    for (const release of releaseCloses) release();
    await Promise.all([restarting, stopping]);
    await flushPromises();

    expect(microphoneLevel.isTesting.value).toBe(false);
  });

  test("a stop that lands while a start is pending leaves the test stopped and the stream it resolves closed", async () => {
    expect.hasAssertions();

    wrapper = await mountMicrophoneLevel();
    const track = { stop: vi.fn<() => void>() };
    const starting = microphoneLevel.start();
    await flushPromises();
    const stopping = microphoneLevel.stop();
    for (const resolve of resolveRequests) resolve(createStream([track]));
    await Promise.all([starting, stopping]);
    await flushPromises();

    expect(microphoneLevel.isTesting.value).toBe(false);
    expect(track.stop).toHaveBeenCalledTimes(1);
  });

  test("two panels reading the level share one microphone stream rather than asking for a second", async () => {
    expect.hasAssertions();

    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          microphoneLevel = useMicrophoneLevel();
          secondMicrophoneLevel = useMicrophoneLevel();
        },
      }),
    );
    const starting = Promise.all([microphoneLevel.start(), secondMicrophoneLevel.start()]);
    await flushPromises();
    for (const resolve of resolveRequests) resolve(createStream());
    await starting;
    await flushPromises();

    expect(getUserMedia).toHaveBeenCalledExactlyOnceWith({ audio: {}, video: false });
    expect(secondMicrophoneLevel.isTesting.value).toBe(true);
  });
});
