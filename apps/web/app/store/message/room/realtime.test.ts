// @vitest-environment nuxt
import RealtimeKitClient from "@cloudflare/realtimekit";
import RealtimeKitVideoBackgroundTransformer from "@cloudflare/realtimekit-virtual-background";
import { EventEmitter } from "node:events";

import { useAlertStore } from "@/store/alert";
import { useMediaStore } from "@/store/message/room/call/media";
import { useRealtimeStore } from "@/store/message/room/realtime";
import { useCallBackgroundStore } from "@/store/message/user/settings/callBackground";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useRealtimeStore, () => {
  const imagePath = "imagePath";

  // The SDK's meeting is replaced by an emitter holding the methods the store calls, so each test drives the events
  // The SDK would emit and reads the spies it needs
  const createMeeting = () => {
    const joinedEvents = new EventEmitter();
    const joined = Object.assign(new Map<string, EventEmitter>(), {
      on: (event: string, listener: (...args: unknown[]) => void) => {
        joinedEvents.on(event, listener);
      },
    });
    const self = Object.assign(new EventEmitter(), {
      addAudioMiddleware: vi.fn(() => Promise.resolve({ message: "", success: true })),
      addVideoMiddleware: vi.fn(() => Promise.resolve({ message: "", success: true })),
      disableAudio: vi.fn(() => Promise.resolve()),
      disableScreenShare: vi.fn(() => Promise.resolve()),
      disableVideo: vi.fn(() => Promise.resolve()),
      enableAudio: vi.fn(() => Promise.resolve()),
      enableScreenShare: vi.fn(() => Promise.resolve()),
      enableVideo: vi.fn(() => Promise.resolve()),
      rawAudioTrack: { applyConstraints: vi.fn(() => Promise.resolve()) },
      removeAllVideoMiddlewares: vi.fn(() => Promise.resolve({ message: "", success: true })),
      setDevice: vi.fn(() => Promise.resolve()),
      videoEnabled: false,
      videoTrack: {} as MediaStreamTrack,
    });
    // The camera's state follows the calls that switch it, as the SDK's does
    self.enableVideo.mockImplementation(() => {
      self.videoEnabled = true;
      return Promise.resolve();
    });
    self.disableVideo.mockImplementation(() => {
      self.videoEnabled = false;
      return Promise.resolve();
    });
    const meeting = {
      join: vi.fn(() => Promise.resolve()),
      leave: vi.fn(() => Promise.resolve()),
      meta: new EventEmitter(),
      participants: Object.assign(new EventEmitter(), { joined }),
      self,
    };
    return { joinedEvents, meeting };
  };

  // A participant is the emitter the SDK hands out, carrying the fields the store reads on attach
  const createParticipant = (customParticipantId: string) =>
    Object.assign(new EventEmitter(), {
      audioEnabled: true,
      audioTrack: {} as MediaStreamTrack,
      customParticipantId,
      screenShareEnabled: false,
      screenShareTracks: {},
      videoEnabled: false,
      videoTrack: {} as MediaStreamTrack,
    });

  const useMeeting = (meeting: ReturnType<typeof createMeeting>["meeting"]) =>
    vi.spyOn(RealtimeKitClient, "init").mockResolvedValue(meeting as unknown as RealtimeKitClient);

  afterEach(() => {
    for (const element of document.querySelectorAll("audio")) element.remove();
    vi.restoreAllMocks();
  });

  // The camera switching off while the background is still being read must not raise an alert: the read's answer
  // Lands in a meeting that is still joined, and the background waits there for the camera to come back
  test("ends a virtual background read quietly when the camera switched off during the read", async () => {
    expect.hasAssertions();

    vi.spyOn(RealtimeKitVideoBackgroundTransformer, "isSupported").mockReturnValue(true);
    const transformer = {
      createStaticBackgroundVideoMiddleware: vi.fn(() => Promise.resolve(vi.fn())),
      destruct: vi.fn(),
    };
    vi.spyOn(RealtimeKitVideoBackgroundTransformer, "init").mockResolvedValue(
      transformer as unknown as RealtimeKitVideoBackgroundTransformer,
    );
    const callBackgroundStore = useCallBackgroundStore();
    const readStarted = Promise.withResolvers<void>();
    const imagePathRead = Promise.withResolvers<string>();
    vi.spyOn(callBackgroundStore, "readVirtualBackgroundImagePath").mockImplementation(() => {
      readStarted.resolve();
      return imagePathRead.promise;
    });
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { meeting } = createMeeting();
    useMeeting(meeting);
    const realtimeStore = useRealtimeStore();
    const { connect, setCamera, setVirtualBackground } = realtimeStore;
    await connect("authToken", vi.fn<() => Promise<void>>(), false);
    await setCamera(true);
    const applying = setVirtualBackground(imagePath);
    await readStarted.promise;
    await setCamera(false);
    imagePathRead.resolve(imagePath);
    await applying;

    expect(alerts.value).toHaveLength(0);
  });

  // The browser keeps the call's sound quiet until the reader's own press, so a refused play raises the notice and
  // The press that answers it clears it
  test("clears the blocked-sound notice once the reader's press lets the sound play", async () => {
    expect.hasAssertions();

    vi.spyOn(HTMLMediaElement.prototype, "play")
      .mockRejectedValueOnce(new DOMException("", "NotAllowedError"))
      .mockResolvedValue();
    const { joinedEvents, meeting } = createMeeting();
    useMeeting(meeting);
    const realtimeStore = useRealtimeStore();
    const { connect, startAudio } = realtimeStore;
    const { isAudioPlaybackBlocked } = storeToRefs(realtimeStore);
    await connect("authToken", vi.fn<() => Promise<void>>(), false);
    const participant = createParticipant("identity");
    joinedEvents.emit("participantJoined", participant);

    await vi.waitFor(() => {
      expect(isAudioPlaybackBlocked.value).toBe(true);
    });

    await startAudio();

    expect(isAudioPlaybackBlocked.value).toBe(false);
  });

  test("attaches a remote microphone muted while the reader is deafened", async () => {
    expect.hasAssertions();

    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    const mediaStore = useMediaStore();
    mediaStore.isDeafened = true;
    const { joinedEvents, meeting } = createMeeting();
    useMeeting(meeting);
    const realtimeStore = useRealtimeStore();
    const { connect } = realtimeStore;
    await connect("authToken", vi.fn<() => Promise<void>>(), false);
    joinedEvents.emit("participantJoined", createParticipant("identity"));

    expect(document.querySelector("audio")?.muted).toBe(true);
  });

  test("removes a participant's microphone element when they leave", async () => {
    expect.hasAssertions();

    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    const { joinedEvents, meeting } = createMeeting();
    useMeeting(meeting);
    const realtimeStore = useRealtimeStore();
    const { connect } = realtimeStore;
    await connect("authToken", vi.fn<() => Promise<void>>(), false);
    const participant = createParticipant("identity");
    joinedEvents.emit("participantJoined", participant);
    joinedEvents.emit("participantLeft", participant);

    expect(document.querySelectorAll("audio")).toHaveLength(0);
  });

  test.each([true, false])(
    "joins with the server's token and turns the microphone on only when the join asks for it, %s",
    async (isMicrophoneEnabled) => {
      expect.hasAssertions();

      const { meeting } = createMeeting();
      const init = useMeeting(meeting);
      const realtimeStore = useRealtimeStore();
      const { connect } = realtimeStore;
      await connect("authToken", vi.fn<() => Promise<void>>(), isMicrophoneEnabled);

      expect(init).toHaveBeenCalledWith(expect.objectContaining({ authToken: "authToken" }));
      expect(meeting.self.enableAudio).toHaveBeenCalledTimes(isMicrophoneEnabled ? 1 : 0);
    },
  );
});
