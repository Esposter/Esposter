// @vitest-environment nuxt
import type {
  LocalTrackPublication,
  LocalVideoTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
} from "livekit-client";

import { useAlertStore } from "@/store/alert";
import { useMediaStore } from "@/store/message/room/call/media";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { useCallBackgroundStore } from "@/store/message/user/settings/callBackground";
import { noop } from "@esposter/shared";
import { Room, RoomEvent, Track } from "livekit-client";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@livekit/track-processors"), async (importOriginal) => ({
  ...(await importOriginal()),
  BackgroundProcessor: () => ({ processedTrack: undefined, switchTo: () => Promise.resolve() }),
  supportsBackgroundProcessors: () => true,
}));

describe(useLiveKitStore, () => {
  const imagePath = "imagePath";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The camera switching off clears the background processor while the background is still being read. Its answer
  // Then has no processor to apply to, and the operation must end quietly rather than fail as an error the user sees
  test("drops a virtual background whose camera switched off while the background was being read", async () => {
    expect.hasAssertions();

    const callBackgroundStore = useCallBackgroundStore();
    const readStarted = Promise.withResolvers<void>();
    const imagePathRead = Promise.withResolvers<string>();
    vi.spyOn(callBackgroundStore, "readVirtualBackgroundImagePath").mockImplementation(() => {
      readStarted.resolve();
      return imagePathRead.promise;
    });
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const room = new Room();
    const liveKitStore = useLiveKitStore();
    const { connect, setCamera, setVirtualBackground } = liveKitStore;
    const videoTrack = {
      getProcessor: () => undefined,
      setProcessor: () => Promise.resolve(),
      stopProcessor: () => Promise.resolve(),
    } as unknown as LocalVideoTrack;
    vi.spyOn(room, "connect").mockResolvedValue();
    vi.spyOn(room.localParticipant, "setMicrophoneEnabled").mockResolvedValue(undefined);
    vi.spyOn(room.localParticipant, "setCameraEnabled").mockResolvedValue({
      videoTrack,
    } as unknown as LocalTrackPublication);
    await connect(room, "", "", vi.fn<() => Promise<void>>(), false);
    await setCamera(true);
    const applying = setVirtualBackground(imagePath);
    await readStarted.promise;
    await setCamera(false);
    imagePathRead.resolve(imagePath);
    await applying;

    expect(alerts.value).toHaveLength(0);
  });

  test("startAudio plays the blocked sound and keeps a deafened reader muted", async () => {
    expect.hasAssertions();

    const element = document.createElement("audio");
    const room = new Room();
    const mediaStore = useMediaStore();
    const liveKitStore = useLiveKitStore();
    const { connect, startAudio } = liveKitStore;
    const { isAudioPlaybackBlocked } = storeToRefs(liveKitStore);
    vi.spyOn(room, "connect").mockResolvedValue();
    vi.spyOn(room.localParticipant, "setMicrophoneEnabled").mockResolvedValue(undefined);
    // LiveKit's own startAudio unmutes every attached element before it reports playback started
    vi.spyOn(room, "startAudio").mockImplementation(() => {
      element.muted = false;
      room.emit(RoomEvent.AudioPlaybackStatusChanged, true);
      return Promise.resolve();
    });
    await connect(room, "", "", vi.fn<() => Promise<void>>(), false);
    mediaStore.isDeafened = true;
    room.emit(
      RoomEvent.TrackSubscribed,
      { attach: () => element } as unknown as RemoteTrack,
      { source: Track.Source.Microphone } as RemoteTrackPublication,
      { identity: "" } as RemoteParticipant,
    );
    room.emit(RoomEvent.AudioPlaybackStatusChanged, false);

    expect(isAudioPlaybackBlocked.value).toBe(true);

    await startAudio();

    expect(isAudioPlaybackBlocked.value).toBe(false);
    expect(element.muted).toBe(true);
  });

  test("startAudio keeps a deafened reader muted when the browser refuses the sound again", async () => {
    expect.hasAssertions();

    const element = document.createElement("audio");
    const room = new Room();
    const mediaStore = useMediaStore();
    const liveKitStore = useLiveKitStore();
    const { connect, startAudio } = liveKitStore;
    vi.spyOn(room, "connect").mockResolvedValue();
    vi.spyOn(room.localParticipant, "setMicrophoneEnabled").mockResolvedValue(undefined);
    vi.spyOn(console, "error").mockImplementation(noop);
    vi.spyOn(room, "startAudio").mockImplementation(() => {
      element.muted = false;
      return Promise.reject(new DOMException("", "NotAllowedError"));
    });
    await connect(room, "", "", vi.fn<() => Promise<void>>(), false);
    mediaStore.isDeafened = true;
    room.emit(
      RoomEvent.TrackSubscribed,
      { attach: () => element } as unknown as RemoteTrack,
      { source: Track.Source.Microphone } as RemoteTrackPublication,
      { identity: "" } as RemoteParticipant,
    );
    await startAudio();

    expect(element.muted).toBe(true);
  });
});
