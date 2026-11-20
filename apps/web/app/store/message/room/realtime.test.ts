// @vitest-environment nuxt
import type { UserSettingsInMessage } from "@esposter/db-schema";

import { useSession } from "#src/services/auth/authClient.test";
import { createMeeting } from "#src/services/message/room/realtime/createMeeting.test";
import { createParticipant } from "#src/services/message/room/realtime/createParticipant.test";
import { spyOnMeetingInit } from "#src/services/message/room/realtime/spyOnMeetingInit.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { useMediaStore } from "#src/store/message/room/call/media";
import { useRealtimeStore } from "#src/store/message/room/realtime";
import { useCallBackgroundStore } from "#src/store/message/user/settings/callBackground";
import { useUserSettingsStore } from "#src/store/message/user/settings/index";
import RealtimeKitClient from "@cloudflare/realtimekit";
import RealtimeKitVideoBackgroundTransformer from "@cloudflare/realtimekit-virtual-background";
import {
  DEFAULT_AUTO_IDLE_THRESHOLD_MS,
  DEFAULT_INPUT_SENSITIVITY_DECIBELS,
  DEFAULT_MICROPHONE_VOLUME_PERCENTAGE,
  DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS,
  DEFAULT_SPEAKER_VOLUME_PERCENTAGE,
  NoiseSuppressionMode,
  VoiceInputMode,
} from "@esposter/db-schema";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

interface MockSessionValue {
  data?: undefined | { user: { id: string } };
}

// A transformer whose middleware and teardown each pick records, so a test reads which one was released
const createTransformer = () => ({
  createStaticBackgroundVideoMiddleware: vi.fn<
    RealtimeKitVideoBackgroundTransformer["createStaticBackgroundVideoMiddleware"]
  >(() =>
    Promise.resolve(
      vi.fn<Awaited<ReturnType<RealtimeKitVideoBackgroundTransformer["createStaticBackgroundVideoMiddleware"]>>>(),
    ),
  ),
  destruct: vi.fn<RealtimeKitVideoBackgroundTransformer["destruct"]>(),
});

describe(useRealtimeStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const imagePath = "imagePath";
  const userSettings: UserSettingsInMessage = {
    autoIdleThresholdMs: DEFAULT_AUTO_IDLE_THRESHOLD_MS,
    createdAt: new Date(0),
    deletedAt: null,
    inputSensitivityDecibels: DEFAULT_INPUT_SENSITIVITY_DECIBELS,
    isDeafenOnJoin: false,
    isMuteOnJoin: false,
    microphoneVolumePercentage: DEFAULT_MICROPHONE_VOLUME_PERCENTAGE,
    noiseSuppressionMode: NoiseSuppressionMode.Custom,
    pushToTalkKeybind: "",
    pushToTalkReleaseDelayMs: DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS,
    speakerVolumePercentage: DEFAULT_SPEAKER_VOLUME_PERCENTAGE,
    updatedAt: new Date(0),
    userId: v7(),
    version: 0,
    virtualBackground: "",
    voiceInputMode: VoiceInputMode.VoiceActivity,
  };
  beforeEach(() => {
    useSession.mockReturnValue(ref<MockSessionValue>({ data: { user: { id: userSettings.userId } } }));
  });

  afterEach(() => {
    for (const element of document.querySelectorAll("audio")) element.remove();
    vi.restoreAllMocks();
  });

  // The camera switching off while the background is still being read must not raise an alert: the read's answer
  // Lands in a meeting that is still joined, and the background waits there for the camera to come back
  test("ends a virtual background read quietly when the camera switched off during the read", async () => {
    expect.hasAssertions();

    vi.spyOn(RealtimeKitVideoBackgroundTransformer, "isSupported").mockReturnValue(true);
    type VideoMiddleware = Awaited<
      ReturnType<RealtimeKitVideoBackgroundTransformer["createStaticBackgroundVideoMiddleware"]>
    >;
    const transformer = {
      createStaticBackgroundVideoMiddleware: vi.fn<
        RealtimeKitVideoBackgroundTransformer["createStaticBackgroundVideoMiddleware"]
      >(() => Promise.resolve(vi.fn<VideoMiddleware>())),
      destruct: vi.fn<RealtimeKitVideoBackgroundTransformer["destruct"]>(),
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

  // A pick a newer pick aborts builds nothing the next pick keeps, so the transformer it made is released with it
  test("releases the transformer a superseded pick built", async () => {
    expect.hasAssertions();

    vi.spyOn(RealtimeKitVideoBackgroundTransformer, "isSupported").mockReturnValue(true);
    const firstTransformer = createTransformer();
    const secondTransformer = createTransformer();
    vi.spyOn(RealtimeKitVideoBackgroundTransformer, "init")
      .mockResolvedValueOnce(firstTransformer as unknown as RealtimeKitVideoBackgroundTransformer)
      .mockResolvedValueOnce(secondTransformer as unknown as RealtimeKitVideoBackgroundTransformer);
    const callBackgroundStore = useCallBackgroundStore();
    const readStarted = Promise.withResolvers<void>();
    const firstRead = Promise.withResolvers<string>();
    vi.spyOn(callBackgroundStore, "readVirtualBackgroundImagePath")
      .mockImplementationOnce(() => {
        readStarted.resolve();
        return firstRead.promise;
      })
      .mockResolvedValue(imagePath);
    const { meeting } = createMeeting();
    spyOnMeetingInit(meeting);
    const realtimeStore = useRealtimeStore();
    const { connect, setCamera, setVirtualBackground } = realtimeStore;
    await connect("authToken", vi.fn<() => Promise<void>>(), false);
    await setCamera(true);
    setVirtualBackground("first");
    await readStarted.promise;
    setVirtualBackground("second");
    firstRead.resolve(imagePath);
    await waitForSynchronizedFunctions();

    expect(firstTransformer.destruct).toHaveBeenCalledTimes(1);
    expect(secondTransformer.destruct).not.toHaveBeenCalled();
  });

  // A pick that fails after building its transformer lets that transformer go, as a superseded pick does
  test("releases the transformer a pick built when the pick fails", async () => {
    expect.hasAssertions();

    vi.spyOn(RealtimeKitVideoBackgroundTransformer, "isSupported").mockReturnValue(true);
    const transformer = createTransformer();
    vi.spyOn(RealtimeKitVideoBackgroundTransformer, "init").mockResolvedValue(
      transformer as unknown as RealtimeKitVideoBackgroundTransformer,
    );
    const callBackgroundStore = useCallBackgroundStore();
    vi.spyOn(callBackgroundStore, "readVirtualBackgroundImagePath").mockRejectedValue(new Error(" "));
    const { meeting } = createMeeting();
    spyOnMeetingInit(meeting);
    const realtimeStore = useRealtimeStore();
    const { connect, setCamera, setVirtualBackground } = realtimeStore;
    await connect("authToken", vi.fn<() => Promise<void>>(), false);
    await setCamera(true);
    setVirtualBackground(imagePath);
    await waitForSynchronizedFunctions();

    expect(transformer.destruct).toHaveBeenCalledExactlyOnceWith();
  });

  // The setting is saved once the video has taken the change, so a background the video refused is not saved
  test("does not save a virtual background the video refused", async () => {
    expect.hasAssertions();

    vi.spyOn(RealtimeKitVideoBackgroundTransformer, "isSupported").mockReturnValue(true);
    vi.spyOn(RealtimeKitVideoBackgroundTransformer, "init").mockResolvedValue(
      createTransformer() as unknown as RealtimeKitVideoBackgroundTransformer,
    );
    const callBackgroundStore = useCallBackgroundStore();
    vi.spyOn(callBackgroundStore, "readVirtualBackgroundImagePath").mockResolvedValue(imagePath);
    const saveUserSettings = vi.fn<() => UserSettingsInMessage>(() => userSettings);
    trpcMsw.user.readUserSettings.query(() => userSettings);
    trpcMsw.user.updateUserSettings.mutation(saveUserSettings);
    const { meeting } = createMeeting();
    meeting.self.addVideoMiddleware.mockRejectedValue(new Error(" "));
    spyOnMeetingInit(meeting);
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const userSettingsStore = useUserSettingsStore();
    const { readUserSettings } = userSettingsStore;
    const realtimeStore = useRealtimeStore();
    const { connect, setCamera, setVirtualBackground } = realtimeStore;
    await readUserSettings();
    await connect("authToken", vi.fn<() => Promise<void>>(), false);
    await setCamera(true);
    setVirtualBackground(imagePath);
    await waitForSynchronizedFunctions();

    expect(alerts.value).toHaveLength(1);
    expect(saveUserSettings).not.toHaveBeenCalled();
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

    expect(document.querySelectorAll("audio")).toHaveLength(1);

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
