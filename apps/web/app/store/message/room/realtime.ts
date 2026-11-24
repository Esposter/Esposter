import type { VideoChange } from "#src/models/message/room/realtime/VideoChange";
import type { VirtualBackgroundPick } from "#src/models/message/room/realtime/VirtualBackgroundPick";
import type { RTKParticipant, RTKSelf } from "@cloudflare/realtimekit";
import type { Promisable } from "type-fest";

import { MicrophoneProcessor } from "#src/models/message/room/call/MicrophoneProcessor";
import { ConnectionQuality } from "#src/models/message/room/realtime/ConnectionQuality";
import { ConnectionState } from "#src/models/message/room/realtime/ConnectionState";
import { RemoteAudioSource } from "#src/models/message/room/realtime/RemoteAudioSource";
import {
  DEFAULT_PARTICIPANT_VOLUME_PERCENTAGE,
  SCREEN_SHARE_CONSTRAINTS,
} from "#src/services/message/room/call/constants";
import { getAudioCaptureDefaults } from "#src/services/message/room/call/getAudioCaptureDefaults";
import { VoiceDeviceKinds, VoiceDeviceSettingsKeyMap } from "#src/services/message/room/call/VoiceDeviceSettingsKeyMap";
import { POOR_CONNECTION_SCORE } from "#src/services/message/room/realtime/constants";
import { getLocalDevices } from "#src/services/message/room/realtime/getLocalDevices";
import { getRemoteAudioKey } from "#src/services/message/room/realtime/getRemoteAudioKey";
import { rasterizeSvg } from "#src/services/message/room/realtime/rasterizeSvg";
import { releaseVirtualBackgroundPick } from "#src/services/message/room/realtime/releaseVirtualBackgroundPick";
import { SocketConnectionStateMap } from "#src/services/message/room/realtime/SocketConnectionStateMap";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useMediaStore } from "#src/store/message/room/call/media";
import { useParticipantStore } from "#src/store/message/room/call/participant";
import { useCallBackgroundStore } from "#src/store/message/user/settings/callBackground";
import { useUserSettingsStore } from "#src/store/message/user/settings/index";
import { useVoiceDeviceSettingsStore } from "#src/store/message/user/settings/voiceDevice";
import RealtimeKitClient from "@cloudflare/realtimekit";
import RealtimeKitVideoBackgroundTransformer from "@cloudflare/realtimekit-virtual-background";
import {
  DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS,
  DEFAULT_SPEAKER_VOLUME_PERCENTAGE,
  NoiseSuppressionMode,
  VoiceInputMode,
} from "@esposter/db-schema";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const useRealtimeStore = defineStore("message/room/realtime", () => {
  let activeMeeting: RealtimeKitClient | undefined;
  let disconnectHandler: (() => Promisable<void>) | undefined;
  let hasVirtualBackground = false;
  let microphoneProcessor: MicrophoneProcessor | undefined;
  let pushToTalkReleaseTimeoutId: number | undefined;
  let videoBackgroundTransformer: RealtimeKitVideoBackgroundTransformer | undefined;
  const { run: runVirtualBackground } = useRunScope();
  const mediaStore = useMediaStore();
  const { setLocalScreenShareStream, setRemoteScreenShareStream, setRemoteVideoStream } = mediaStore;
  const participantStore = useParticipantStore();
  const userSettingsStore = useUserSettingsStore();
  const { updateUserSettings } = userSettingsStore;
  const callBackgroundStore = useCallBackgroundStore();
  const { readVirtualBackgroundImagePath } = callBackgroundStore;
  // Persisted (localStorage) device selections are the single source of truth, shared with the settings
  // Panel, mic test, and pre-join preview - so the call captures the device the user actually picked.
  const voiceDeviceSettingsStore = useVoiceDeviceSettingsStore();
  const remoteAudioElementMap = new Map<string, { element: HTMLAudioElement; identity: string }>();
  const connectionQuality = ref<ConnectionQuality>(ConnectionQuality.Unknown);
  const connectionState = ref<ConnectionState>(ConnectionState.Disconnected);
  // The browser refused to play the call's sound without a gesture of the reader's own: it stays silent until they
  // Press the notice's button, whose click is the gesture play() needs
  const isAudioPlaybackBlocked = ref(false);
  const clearRemoteAudio = () => {
    for (const { element } of remoteAudioElementMap.values()) element.remove();
    remoteAudioElementMap.clear();
  };
  const setRemoteAudioMuted = (isDeafened: boolean) => {
    for (const { element } of remoteAudioElementMap.values()) element.muted = isDeafened;
  };
  // Master output volume × per-participant multiplier — HTMLMediaElement.volume caps at 1,
  // So combined values above 100% clamp to full.
  const applyRemoteAudioVolume = (element: HTMLAudioElement, identity: string) => {
    const speakerVolumePercentage =
      userSettingsStore.userSettings?.speakerVolumePercentage ?? DEFAULT_SPEAKER_VOLUME_PERCENTAGE;
    const participantVolumePercentage =
      mediaStore.participantVolumePercentageMap.get(identity) ?? DEFAULT_PARTICIPANT_VOLUME_PERCENTAGE;
    element.volume = Math.min(1, (speakerVolumePercentage / 100) * (participantVolumePercentage / 100));
  };
  const applySpeakerVolume = () => {
    for (const { element, identity } of remoteAudioElementMap.values()) applyRemoteAudioVolume(element, identity);
  };
  const playRemoteAudio = (element: HTMLAudioElement) =>
    getResultAsync(async () => {
      await element.play();
      isAudioPlaybackBlocked.value = false;
    }).match(noop, (error) => {
      if (error instanceof DOMException && error.name === "NotAllowedError") isAudioPlaybackBlocked.value = true;
      else console.error(error);
    });
  const playRemoteAudioInBackground = getSynchronizedFunction(playRemoteAudio);
  const setSinkIdInBackground = getSynchronizedFunction((element: HTMLAudioElement, outputDeviceId: string) =>
    getResultAsync(() => element.setSinkId(outputDeviceId)).match(noop, console.error),
  );
  // A speaker picked mid-call reaches the elements already on the page through the SDK, so an element attached later
  // Takes the picked output here rather than the system default
  const setRemoteAudio = (key: string, identity: string, track: MediaStreamTrack | undefined) => {
    remoteAudioElementMap.get(key)?.element.remove();
    remoteAudioElementMap.delete(key);
    if (!track) return;
    const element = window.document.createElement("audio");
    element.autoplay = true;
    element.muted = mediaStore.isDeafened;
    element.srcObject = new MediaStream([track]);
    applyRemoteAudioVolume(element, identity);
    const outputDeviceId = voiceDeviceSettingsStore.outputDeviceId;
    if (outputDeviceId) setSinkIdInBackground(element, outputDeviceId);
    remoteAudioElementMap.set(key, { element, identity });
    window.document.body.append(element);
    playRemoteAudioInBackground(element);
  };
  const setRemoteScreenShare = (
    identity: string,
    isScreenSharing: boolean,
    { audio, video }: { audio?: MediaStreamTrack; video?: MediaStreamTrack },
  ) => {
    setRemoteAudio(
      getRemoteAudioKey(identity, RemoteAudioSource.ScreenShare),
      identity,
      isScreenSharing ? audio : undefined,
    );
    setRemoteScreenShareStream(identity, isScreenSharing && video ? new MediaStream([video]) : undefined);
  };
  const setActiveSpeaker = (identity: string | undefined) => {
    participantStore.speakingIds = identity ? [identity] : [];
  };
  const setNoiseSuppressionMode = getSynchronizedFunction((noiseSuppressionMode: NoiseSuppressionMode) =>
    getResultAsync(async () => {
      if (!activeMeeting) return;
      await activeMeeting.self.rawAudioTrack.applyConstraints(getAudioCaptureDefaults(noiseSuppressionMode));
    }).match(noop, console.error),
  );
  const applyMicrophoneSettings = () => {
    const settings = userSettingsStore.userSettings;
    if (!microphoneProcessor || !settings) return;
    microphoneProcessor.inputSensitivityDecibels = settings.inputSensitivityDecibels;
    microphoneProcessor.microphoneVolumePercentage = settings.microphoneVolumePercentage;
    microphoneProcessor.voiceInputMode = settings.voiceInputMode;
    if (settings.voiceInputMode !== VoiceInputMode.PushToTalk) microphoneProcessor.isPushToTalkKeyHeld = false;
  };
  // Push-to-talk gate: pressing opens instantly; releasing closes after the configured grace period
  // So word endings aren't clipped (Discord's release delay). Pressing again cancels a pending close.
  const setPushToTalkKeyHeld = (isPushToTalkKeyHeld: boolean) => {
    window.clearTimeout(pushToTalkReleaseTimeoutId);
    pushToTalkReleaseTimeoutId = undefined;
    if (!microphoneProcessor) return;
    else if (isPushToTalkKeyHeld) microphoneProcessor.isPushToTalkKeyHeld = true;
    else
      pushToTalkReleaseTimeoutId = window.setTimeout(() => {
        if (microphoneProcessor) microphoneProcessor.isPushToTalkKeyHeld = false;
        pushToTalkReleaseTimeoutId = undefined;
      }, userSettingsStore.userSettings?.pushToTalkReleaseDelayMs ?? DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS);
  };
  const setActiveDevice = (kind: MediaDeviceKind, deviceId: string) => {
    voiceDeviceSettingsStore[VoiceDeviceSettingsKeyMap[kind]] = deviceId;
  };
  const setLocalVideo = (self: RTKSelf) => {
    mediaStore.isCameraEnabled = self.videoEnabled;
    mediaStore.localVideoStream = self.videoEnabled ? new MediaStream([self.videoTrack]) : undefined;
  };
  const setLocalScreenShare = (
    isScreenSharing: boolean,
    { audio, video }: { audio?: MediaStreamTrack; video?: MediaStreamTrack },
  ) => {
    mediaStore.isScreenSharing = isScreenSharing;
    setLocalScreenShareStream(isScreenSharing && video ? new MediaStream(audio ? [video, audio] : [video]) : undefined);
  };
  const attachRemoteParticipant = (participant: RTKParticipant) => {
    const identity = participant.customParticipantId;
    if (!identity) return;
    setRemoteAudio(
      getRemoteAudioKey(identity, RemoteAudioSource.Microphone),
      identity,
      participant.audioEnabled ? participant.audioTrack : undefined,
    );
    setRemoteVideoStream(identity, participant.videoEnabled ? new MediaStream([participant.videoTrack]) : undefined);
    setRemoteScreenShare(identity, participant.screenShareEnabled, participant.screenShareTracks);
    participant.on("audioUpdate", ({ audioEnabled, audioTrack }) => {
      setRemoteAudio(
        getRemoteAudioKey(identity, RemoteAudioSource.Microphone),
        identity,
        audioEnabled ? audioTrack : undefined,
      );
    });
    participant.on("videoUpdate", ({ videoEnabled, videoTrack }) => {
      setRemoteVideoStream(identity, videoEnabled ? new MediaStream([videoTrack]) : undefined);
    });
    participant.on("screenShareUpdate", ({ screenShareEnabled, screenShareTracks }) => {
      setRemoteScreenShare(identity, screenShareEnabled, screenShareTracks);
    });
  };
  const detachRemoteParticipant = ({ customParticipantId: identity }: RTKParticipant) => {
    if (!identity) return;
    setRemoteAudio(getRemoteAudioKey(identity, RemoteAudioSource.Microphone), identity, undefined);
    setRemoteScreenShare(identity, false, {});
    setRemoteVideoStream(identity, undefined);
  };
  // The camera and screen share the meeting reports are the local state, so a background that replaces the track
  // Shows its processed frames without the store asking for them
  const registerSelf = (meeting: RealtimeKitClient) => {
    meeting.self.on("videoUpdate", () => {
      setLocalVideo(meeting.self);
    });
    meeting.self.on("screenShareUpdate", ({ screenShareEnabled, screenShareTracks }) => {
      setLocalScreenShare(screenShareEnabled, screenShareTracks);
    });
    meeting.self.on("mediaScoreUpdate", ({ isScreenshare, score }) => {
      if (isScreenshare) return;
      connectionQuality.value = score < POOR_CONNECTION_SCORE ? ConnectionQuality.Poor : ConnectionQuality.Good;
    });
    meeting.self.on("roomJoined", () => {
      connectionState.value = ConnectionState.Connected;
    });
    meeting.self.on("roomLeft", ({ state }) => {
      connectionState.value = ConnectionState.Disconnected;
      // The server's kick is not the call ending: a moderator's kick ends the call through its admin action, and a
      // Revoke's kick is followed by the token to rejoin with, so the call is not left here
      if (state !== "kicked") onDisconnected();
    });
    meeting.meta.on("socketConnectionUpdate", ({ state }) => {
      connectionState.value = SocketConnectionStateMap[state];
    });
    meeting.participants.on("activeSpeaker", ({ peerId }) => {
      setActiveSpeaker(meeting.participants.joined.get(peerId)?.customParticipantId);
    });
  };
  const onDisconnected = getSynchronizedFunction(() =>
    getResultAsync(async () => {
      const handler = disconnectHandler;
      disconnectHandler = undefined;
      await handler?.();
    }).match(noop, console.error),
  );
  // Plays every remote element. The press that calls this is the gesture the browser needs, and a failure reports
  // Through the notice rather than as an error
  const startAudio = () =>
    Promise.all(Array.from(remoteAudioElementMap.values(), ({ element }) => playRemoteAudio(element)));
  const setCamera = async (isCameraEnabled: boolean) => {
    if (!activeMeeting) return;
    if (!isCameraEnabled) {
      await activeMeeting.self.disableVideo();
      return;
    }
    await activeMeeting.self.enableVideo();
    // The persisted pick is what a camera starting mid-call has to composite, because the ref is per-call and
    // A user who chose a background last session never touched the picker this one. Applied rather than set:
    // Restoring a selection is not the user making it again, so it owes the settings row no write
    const virtualBackground = mediaStore.selectedVirtualBackground || userSettingsStore.userSettings?.virtualBackground;
    if (virtualBackground && !hasVirtualBackground) applyVirtualBackground(virtualBackground, noop);
  };
  const setMicrophone = async (isMicrophoneEnabled: boolean) => {
    if (!activeMeeting) return;
    else if (isMicrophoneEnabled) await activeMeeting.self.enableAudio();
    else await activeMeeting.self.disableAudio();
  };
  const setScreenShare = async (isScreenSharing: boolean) => {
    if (!activeMeeting) return;
    else if (isScreenSharing) await activeMeeting.self.enableScreenShare();
    else await activeMeeting.self.disableScreenShare();
  };
  // Applies a pick's change to the meeting's video. It is the pick's commit, and the run scope holds the next commit
  // Until this one settles, so each remove-and-add completes before the next starts and one pick never composites
  // Over another. `onApplied` runs once the video has taken the change, so a background the video refused is
  // Never saved. A failure alerts
  const applyVirtualBackgroundChange = (
    meeting: RealtimeKitClient,
    { middleware }: VideoChange,
    onApplied: () => void,
  ) =>
    getResultAsync(async () => {
      await meeting.self.removeAllVideoMiddlewares();
      hasVirtualBackground = false;
      if (middleware) {
        await meeting.self.addVideoMiddleware(middleware);
        hasVirtualBackground = true;
      }
      setLocalVideo(meeting.self);
      onApplied();
    }).match(noop, createErrorAlert);
  // The pipeline's awaits, which change nothing on their own: what it resolves is the commit's to apply. A transformer
  // It builds goes out with the pick, so the commit keeps it and a run that does not commit releases it
  const readVirtualBackgroundPick = async (virtualBackground: string): Promise<undefined | VirtualBackgroundPick> => {
    const meeting = activeMeeting;
    if (!meeting?.self.videoEnabled) return undefined;
    else if (!RealtimeKitVideoBackgroundTransformer.isSupported()) {
      console.warn("Virtual backgrounds are not supported in this browser.");
      return undefined;
    }

    const heldTransformer = videoBackgroundTransformer;
    const transformer = heldTransformer ?? (await RealtimeKitVideoBackgroundTransformer.init({ meeting }));
    const createdTransformer = heldTransformer ? undefined : transformer;
    // A run that fails returns no pick for its release to take, so a transformer this pick built is let go here
    return getResultAsync(async () => {
      const imagePath = await readVirtualBackgroundImagePath(virtualBackground);
      // A slot that has been deleted resolves to nothing, which lands here as the same no-background the None entry
      // Selects - a missing image must never leave a call with a broken video track
      if (!imagePath) return { createdTransformer, meeting, videoChange: {} };
      // Only the presets are SVGs; an uploaded slot arrives as a signed url the middleware can take directly
      const resolvedPath = imagePath.endsWith(".svg") ? await rasterizeSvg(imagePath) : imagePath;
      if (!resolvedPath) return { createdTransformer, meeting };
      const middleware = await transformer.createStaticBackgroundVideoMiddleware(resolvedPath);
      return { createdTransformer, meeting, videoChange: { middleware } };
    })
      .orTee(() => {
        createdTransformer?.destruct();
      })
      .match(
        (pick) => pick,
        (error) => {
          throw error;
        },
      );
  };
  // The one commit of a pick. A pick made for a meeting that has since been left releases what it built and
  // Saves nothing. A pick with no change to apply has nothing the video could refuse, so its setting is saved at once
  const commitVirtualBackgroundPick = (
    pick: undefined | VirtualBackgroundPick,
    onApplied: () => void,
  ): Promise<void> => {
    if (!pick) onApplied();
    else if (pick.meeting === activeMeeting) {
      if (pick.createdTransformer) videoBackgroundTransformer = pick.createdTransformer;
      if (pick.videoChange) return applyVirtualBackgroundChange(pick.meeting, pick.videoChange, onApplied);
      onApplied();
    } else releaseVirtualBackgroundPick(pick);
    return Promise.resolve();
  };
  // Clicking through the background picker means only the last pick matters, so each pick is a run in one scope: a
  // Later pick aborts this one, and only the newest pick commits. The pick is drawn as it is made, and a pipeline that
  // Fails leaves no pick in its place, since the one it replaced is not put back. `onApplied` runs for the pick in
  // Force only, so a slow selection that a later one has overtaken never writes the settings row naming a background
  // The call is not showing
  const applyVirtualBackground = (virtualBackground: string, onApplied: () => void) => {
    mediaStore.selectedVirtualBackground = virtualBackground;
    getSynchronizedFunction(() =>
      getResultAsync(() =>
        runVirtualBackground(
          () => readVirtualBackgroundPick(virtualBackground),
          (pick) => commitVirtualBackgroundPick(pick, onApplied),
          releaseVirtualBackgroundPick,
        ),
      ).match(noop, (error) => {
        mediaStore.selectedVirtualBackground = "";
        createErrorAlert(error);
      }),
    )();
  };
  // The pick the user actually made is the only one worth remembering, so it is persisted once the pipeline has taken
  // It
  const setVirtualBackground = (virtualBackground: string) => {
    applyVirtualBackground(virtualBackground, () => {
      updateUserSettings({ virtualBackground });
    });
  };
  // Selecting a device just writes the persisted ref (via setActiveDevice); these watchers hand the pick to the
  // Meeting, which switches the live device of that kind
  const syncDeviceToMeeting = getSynchronizedFunction((kind: MediaDeviceKind, deviceId: string) =>
    getResultAsync(async () => {
      if (!activeMeeting || !deviceId) return;
      const device = (await getLocalDevices(kind)).find((localDevice) => localDevice.deviceId === deviceId);
      if (device) await activeMeeting.self.setDevice(device);
    }).match(noop, console.error),
  );
  for (const kind of VoiceDeviceKinds)
    watch(
      () => voiceDeviceSettingsStore[VoiceDeviceSettingsKeyMap[kind]],
      (newDeviceId) => {
        syncDeviceToMeeting(kind, newDeviceId);
      },
    );
  const connect = async (
    authToken: string,
    newDisconnectHandler: () => Promisable<void>,
    isMicrophoneEnabled: boolean,
  ) => {
    await disconnect();
    const { autoGainControl, echoCancellation, noiseSuppression } = getAudioCaptureDefaults(
      userSettingsStore.userSettings?.noiseSuppressionMode ?? NoiseSuppressionMode.Custom,
    );
    const meeting = await RealtimeKitClient.init({
      authToken,
      defaults: {
        audio: false,
        mediaConfiguration: {
          // The SDK spells its noise-suppression option this way, so the browser's name is mapped at this one boundary
          audio: { autoGainControl, echoCancellation, noiseSupression: noiseSuppression },
          screenshare: SCREEN_SHARE_CONSTRAINTS,
        },
        video: false,
      },
    });
    activeMeeting = meeting;
    disconnectHandler = newDisconnectHandler;
    connectionState.value = ConnectionState.Connecting;
    registerSelf(meeting);
    microphoneProcessor = new MicrophoneProcessor();
    applyMicrophoneSettings();
    await meeting.self.addAudioMiddleware(microphoneProcessor.audioMiddleware);
    /* oxlint-disable-next-line unicorn/require-array-join-separator -- RealtimeKit's meeting.join() is not Array#join
       and takes no separator */
    await meeting.join();
    // Participants already in the meeting are attached here, and the listeners that follow are registered in the same
    // Tick, so no join or leave can land between the two
    for (const participant of meeting.participants.joined.values()) attachRemoteParticipant(participant);
    meeting.participants.joined.on("participantJoined", attachRemoteParticipant);
    meeting.participants.joined.on("participantLeft", detachRemoteParticipant);
    // The picks are applied while the microphone and camera are still off, so nothing is captured on the default first
    for (const kind of VoiceDeviceKinds)
      syncDeviceToMeeting(kind, voiceDeviceSettingsStore[VoiceDeviceSettingsKeyMap[kind]]);
    if (isMicrophoneEnabled) await meeting.self.enableAudio();
  };
  const disconnect = async () => {
    const meeting = activeMeeting;
    const processor = microphoneProcessor;
    activeMeeting = undefined;
    disconnectHandler = undefined;
    microphoneProcessor = undefined;
    window.clearTimeout(pushToTalkReleaseTimeoutId);
    pushToTalkReleaseTimeoutId = undefined;
    videoBackgroundTransformer?.destruct();
    videoBackgroundTransformer = undefined;
    hasVirtualBackground = false;
    connectionQuality.value = ConnectionQuality.Unknown;
    connectionState.value = ConnectionState.Disconnected;
    isAudioPlaybackBlocked.value = false;
    clearRemoteAudio();
    await processor?.destroy();
    // Leaving releases the local tracks and the media handler, so it is the last step
    await meeting?.leave();
  };
  // A revoke that narrows the connection replaces it, and its user joins the meeting again with the token it
  // Was handed. The devices carry across, the microphone only where the new preset still allows it, and the camera
  // Comes back on if it was on. A screen share ends with the connection it was shared on, since the browser's picker
  // Has to be answered afresh. Each rejoin waits for the one before it, since each replaces the meeting the next one
  // Reads: a second revoke's token joins once the first meeting is left, rather than being dropped while that meeting
  // Is still being replaced
  const rejoinMeeting = (authToken: string, canPublishMicrophone: boolean) =>
    getResultAsync(async () => {
      const meeting = activeMeeting;
      const handler = disconnectHandler;
      if (!meeting || !handler) return;
      const isCameraEnabled = meeting.self.videoEnabled;
      await connect(authToken, handler, canPublishMicrophone && meeting.self.audioEnabled);
      if (isCameraEnabled) await setCamera(true);
      setLocalScreenShare(false, {});
    }).match(noop, console.error);
  const { executeBackgroundMutation } = useMutation();
  const rejoin = (authToken: string, canPublishMicrophone: boolean) => {
    executeBackgroundMutation(() => rejoinMeeting(authToken, canPublishMicrophone), { key: "rejoin" });
  };
  watch(
    () => userSettingsStore.userSettings?.speakerVolumePercentage,
    () => {
      applySpeakerVolume();
    },
  );
  watchDeep(
    () => mediaStore.participantVolumePercentageMap,
    () => {
      applySpeakerVolume();
    },
  );
  watch(
    () => userSettingsStore.userSettings?.noiseSuppressionMode,
    (newNoiseSuppressionMode) => {
      if (newNoiseSuppressionMode) setNoiseSuppressionMode(newNoiseSuppressionMode);
    },
  );
  watch(
    () => [
      userSettingsStore.userSettings?.inputSensitivityDecibels,
      userSettingsStore.userSettings?.microphoneVolumePercentage,
      userSettingsStore.userSettings?.voiceInputMode,
    ],
    () => {
      applyMicrophoneSettings();
    },
  );

  return {
    connect,
    connectionQuality,
    connectionState,
    disconnect,
    isAudioPlaybackBlocked,
    rejoin,
    setActiveDevice,
    setCamera,
    setMicrophone,
    setPushToTalkKeyHeld,
    setRemoteAudioMuted,
    setScreenShare,
    setVirtualBackground,
    startAudio,
  };
});
