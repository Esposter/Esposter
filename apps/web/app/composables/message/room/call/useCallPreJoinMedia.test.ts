// @vitest-environment nuxt
import { useCallPreJoinMedia } from "@/composables/message/room/call/useCallPreJoinMedia";
import { MediaStreamKind } from "@/models/message/room/call/MediaStreamKind";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, test, vi } from "vitest";

interface PendingRequest {
  constraints: MediaStreamConstraints;
  resolve: (stream: MediaStream) => void;
}

describe(useCallPreJoinMedia, () => {
  let getUserMedia: ReturnType<typeof vi.fn<(constraints: MediaStreamConstraints) => Promise<MediaStream>>>;
  let pendingRequests: PendingRequest[];
  let media: ReturnType<typeof useCallPreJoinMedia>;

  // Each request stays pending until the test grants it, so a toggle can land while the mount's probe is still waiting
  const grantRequests = (kind: MediaStreamKind, stream = { getTracks: () => [] } as unknown as MediaStream) => {
    const granted = pendingRequests.filter(({ constraints }) => Boolean(constraints[kind]));
    pendingRequests = pendingRequests.filter((request) => !granted.includes(request));
    for (const { resolve } of granted) resolve(stream);
  };
  const countRequests = (kind: MediaStreamKind) =>
    getUserMedia.mock.calls.filter(([constraints]) => Boolean(constraints[kind])).length;
  const mountCallPreJoinMedia = () =>
    mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          media = useCallPreJoinMedia();
        },
      }),
    );

  beforeEach(() => {
    pendingRequests = [];
    getUserMedia = vi.fn<(constraints: MediaStreamConstraints) => Promise<MediaStream>>(
      (constraints) =>
        new Promise<MediaStream>((resolve) => {
          pendingRequests.push({ constraints, resolve });
        }),
    );
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia } });
    const knockerStore = useKnockerStore();
    const { resetKnockerState } = knockerStore;
    resetKnockerState();
  });

  test("a camera toggle during the mount's camera request joins it rather than requesting a second stream", async () => {
    expect.hasAssertions();

    await mountCallPreJoinMedia();
    const toggling = media.toggleCamera();
    await flushPromises();
    grantRequests(MediaStreamKind.Video);
    await toggling;
    await flushPromises();

    expect(countRequests(MediaStreamKind.Video)).toBe(1);
    expect(media.isCameraEnabled.value).toBe(true);
  });

  test("a microphone probe that lands after a mute leaves the mute in place", async () => {
    expect.hasAssertions();

    await mountCallPreJoinMedia();
    await media.toggleMicrophone();
    grantRequests(MediaStreamKind.Audio);
    await flushPromises();

    expect(media.isMicrophoneEnabled.value).toBe(false);
  });

  test("a camera granted after the page is left is stopped rather than kept live", async () => {
    expect.hasAssertions();

    const wrapper = await mountCallPreJoinMedia();
    const stopTrack = vi.fn<() => void>();
    wrapper.unmount();
    grantRequests(MediaStreamKind.Video, { getTracks: () => [{ stop: stopTrack }] } as unknown as MediaStream);
    await flushPromises();

    expect(stopTrack).toHaveBeenCalledTimes(1);
  });
});
