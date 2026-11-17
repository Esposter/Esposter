// @vitest-environment nuxt
import { createMeeting } from "#src/services/message/room/realtime/createMeeting.test";
import { createParticipant } from "#src/services/message/room/realtime/createParticipant.test";
import { spyOnMeetingInit } from "#src/services/message/room/realtime/spyOnMeetingInit.test";
import { useAlertStore } from "#src/store/alert";
import { useMediaStore } from "#src/store/message/room/call/media";
import { useRealtimeStore } from "#src/store/message/room/realtime";
import { useCallBackgroundStore } from "#src/store/message/user/settings/callBackground";
import RealtimeKitClient from "@cloudflare/realtimekit";
import RealtimeKitVideoBackgroundTransformer from "@cloudflare/realtimekit-virtual-background";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(useRealtimeStore, () => {
  const imagePath = "imagePath";

  afterEach(() => {
    for (const element of document.querySelectorAll("audio")) element.remove();
    vi.restoreAllMocks();
  });

  // The camera switching off while the background is still being read must not raise an alert: the read's answer
  // Lands in a meeting that is still joined, and the background waits there for the camera to come back
  test("ends a virtual background read quietly when the camera switched off during the read", async () => {
    expect.hasAssertions();

    vi.spyOn(RealtimeKitVideoBackgroundTransformer, "isSupported").mockReturnValue(true);
    type VideoBackgroundTransformer = RealtimeKitVideoBackgroundTransformer;
    type VideoMiddleware = Awaited<ReturnType<VideoBackgroundTransformer["createStaticBackgroundVideoMiddleware"]>>;
    const transformer = {
      createStaticBackgroundVideoMiddleware: vi.fn<VideoBackgroundTransformer["createStaticBackgroundVideoMiddleware"]>(
        () => Promise.resolve(vi.fn<VideoMiddleware>()),
      ),
      destruct: vi.fn<VideoBackgroundTransformer["destruct"]>(),
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
    spyOnMeetingInit(meeting);
    const realtimeStore = useRealtimeStore();
    const { connect, setCamera, setVirtualBackground } = realtimeStore;
    await connect("authToken", vi.fn<() => Promise<void>>(), false);
    await setCamera(true);
    setVirtualBackground(imagePath);
    await readStarted.promise;
    await setCamera(false);
    imagePathRead.resolve(imagePath);
    await flushPromises();

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
    spyOnMeetingInit(meeting);
    const realtimeStore = useRealtimeStore();
    const { connect, startAudio } = realtimeStore;
    const { isAudioPlaybackBlocked } = storeToRefs(realtimeStore);
    await connect("authToken", vi.fn<() => Promise<void>>(), false);
    const participant = createParticipant("identity");
    joinedEvents.emit("participantJoined", participant);

    await waitForSynchronizedFunctions();

    expect(isAudioPlaybackBlocked.value).toBe(true);

    await startAudio();

    expect(isAudioPlaybackBlocked.value).toBe(false);
  });

  test("attaches a remote microphone muted while the reader is deafened", async () => {
    expect.hasAssertions();

    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    const mediaStore = useMediaStore();
    mediaStore.isDeafened = true;
    const { joinedEvents, meeting } = createMeeting();
    spyOnMeetingInit(meeting);
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
    spyOnMeetingInit(meeting);
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
      const init = spyOnMeetingInit(meeting);
      const realtimeStore = useRealtimeStore();
      const { connect } = realtimeStore;
      await connect("authToken", vi.fn<() => Promise<void>>(), isMicrophoneEnabled);

      expect(init.mock.lastCall?.[0].authToken).toBe("authToken");
      expect(meeting.self.enableAudio).toHaveBeenCalledTimes(isMicrophoneEnabled ? 1 : 0);
    },
  );

  // A revoke that narrows the connection kicks it, and the kick reaches the client as a leave of its meeting. That leave
  // Is not the call ending, so the disconnect handler stays in place for the rejoin that follows with the new token
  test("a kick from the meeting does not end the call, so the rejoin that follows still has it to rejoin", async () => {
    expect.hasAssertions();

    const first = createMeeting();
    const second = createMeeting();
    const init = vi
      .spyOn(RealtimeKitClient, "init")
      .mockResolvedValueOnce(first.meeting as unknown as RealtimeKitClient)
      .mockResolvedValueOnce(second.meeting as unknown as RealtimeKitClient);
    const realtimeStore = useRealtimeStore();
    const { connect, rejoin } = realtimeStore;
    const disconnectHandler = vi.fn<() => Promise<void>>();
    await connect("authToken", disconnectHandler, false);

    first.meeting.self.emit("roomLeft", { state: "kicked" });
    rejoin("rejoinToken", false);
    await waitForSynchronizedFunctions();

    expect(disconnectHandler).not.toHaveBeenCalled();
    expect(init.mock.lastCall?.[0].authToken).toBe("rejoinToken");
  });

  test("a lost connection still ends the call", async () => {
    expect.hasAssertions();

    const { meeting } = createMeeting();
    spyOnMeetingInit(meeting);
    const realtimeStore = useRealtimeStore();
    const { connect } = realtimeStore;
    const disconnectHandler = vi.fn<() => Promise<void>>();
    await connect("authToken", disconnectHandler, false);

    meeting.self.emit("roomLeft", { state: "disconnected" });
    await waitForSynchronizedFunctions();

    expect(disconnectHandler).toHaveBeenCalledExactlyOnceWith();
  });

  // The camera was on before the revoke, so it comes back on. The microphone comes back only where the new preset still
  // Allows it, since a revoke that took it leaves the new connection unable to publish it
  test.each([true, false])(
    "rejoins with the new token, the camera back on and the microphone on only where the new preset allows it, %s",
    async (canPublishMicrophone) => {
      expect.hasAssertions();

      const first = createMeeting();
      const second = createMeeting();
      vi.spyOn(RealtimeKitClient, "init")
        .mockResolvedValueOnce(first.meeting as unknown as RealtimeKitClient)
        .mockResolvedValueOnce(second.meeting as unknown as RealtimeKitClient);
      const realtimeStore = useRealtimeStore();
      const { connect, rejoin, setCamera } = realtimeStore;
      await connect("authToken", vi.fn<() => Promise<void>>(), true);
      Object.assign(first.meeting.self, { audioEnabled: true });
      await setCamera(true);

      rejoin("rejoinToken", canPublishMicrophone);
      await waitForSynchronizedFunctions();

      expect(first.meeting.leave).toHaveBeenCalledExactlyOnceWith();
      expect(second.meeting.self.enableAudio).toHaveBeenCalledTimes(canPublishMicrophone ? 1 : 0);
      expect(second.meeting.self.enableVideo).toHaveBeenCalledExactlyOnceWith();
    },
  );
});
