import type { RTKParticipant, RTKSelf } from "@cloudflare/realtimekit";

import { MicrophoneProcessor } from "@/models/message/room/call/MicrophoneProcessor";
import { ConnectionQuality } from "@/models/message/room/realtime/ConnectionQuality";
import { ConnectionState } from "@/models/message/room/realtime/ConnectionState";
import { RemoteAudioSource } from "@/models/message/room/realtime/RemoteAudioSource";
import { MutationStatus } from "@/models/shared/MutationStatus";
import {
  DEFAULT_PARTICIPANT_VOLUME_PERCENTAGE,
  SCREEN_SHARE_CONSTRAINTS,
} from "@/services/message/room/call/constants";
import { getAudioCaptureDefaults } from "@/services/message/room/call/getAudioCaptureDefaults";
import { VoiceDeviceKinds, VoiceDeviceSettingsKeyMap } from "@/services/message/room/call/VoiceDeviceSettingsKeyMap";
import { POOR_CONNECTION_SCORE } from "@/services/message/room/realtime/constants";
import { getLocalDevices } from "@/services/message/room/realtime/getLocalDevices";
import { rasterizeSvg } from "@/services/message/room/realtime/rasterizeSvg";
import { SocketConnectionStateMap } from "@/services/message/room/realtime/SocketConnectionStateMap";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { useUserSettingsStore } from "@/store/message/user/settings";
import { useCallBackgroundStore } from "@/store/message/user/settings/callBackground";
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voiceDevice";
import RealtimeKitClient from "@cloudflare/realtimekit";
import RealtimeKitVideoBackgroundTransformer from "@cloudflare/realtimekit-virtual-background";
import {
  DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS,
  DEFAULT_SPEAKER_VOLUME_PERCENTAGE,
  NoiseSuppressionMode,
  VoiceInputMode,
} from "@esposter/db-schema";
import { getResultAsync, getSynchronizedFunction, ID_SEPARATOR, noop } from "@esposter/shared";

export const useRealtimeStore = defineStore("message/room/realtime", () => {
  let activeMeeting: RealtimeKitClient | undefined;
  let disconnectHandler: (() => Promise<void>) | undefined;
  let hasVirtualBackground = false;
  let microphoneProcessor: MicrophoneProcessor | undefined;
  let pushToTalkReleaseTimeoutId: number | undefined;
  let videoBackgroundTransformer: RealtimeKitVideoBackgroundTransformer | undefined;
  const { executeMutation: executeSetVirtualBackgroundMutation } = useMutation();
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
  const remoteAudioElements = new Map<string, { element: HTMLAudioElement; identity: string }>();
  const connectionQuality = ref(ConnectionQuality.Unknown);
  const connectionState = ref(ConnectionState.Disconnected);
  // The browser refused to play the call's sound without a gesture of the reader's own: it stays silent until they
  // Press the notice's button, whose click is the gesture play() needs
  const isAudioPlaybackBlocked = ref(false);
  const getRemoteAudioKey = (identity: string, source: RemoteAudioSource) => `${identity}${ID_SEPARATOR}${source}`;
  const clearRemoteAudio = () => {
    for (const { element } of remoteAudioElements.values()) element.remove();
    remoteAudioElements.clear();
  };
  const setRemoteAudioMuted = (isDeafened: boolean) => {
    for (const { element } of remoteAudioElements.values()) element.muted = isDeafened;
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
    for (const { element, identity } of remoteAudioElements.values()) applyRemoteAudioVolume(element, identity);
  };
  const playRemoteAudio = (element: HTMLAudioElement) =>
    getResultAsync(async () => {
      await element.play();
      isAudioPlaybackBlocked.value = false;
    }).match(noop, (error) => {
      if (error instanceof DOMException && error.name === "NotAllowedError") isAudioPlaybackBlocked.value = true;
      else console.error(error);
    });
  // A speaker picked mid-call reaches the elements already on the page through the SDK, so an element attached later
  // Takes the picked output here rather than the system default
  const setRemoteAudio = (key: string, identity: string, track: MediaStreamTrack | undefined) => {
    remoteAudioElements.get(key)?.element.remove();
    remoteAudioElements.delete(key);
    if (!track) return;
    const element = window.document.createElement("audio");
    element.autoplay = true;
    element.muted = mediaStore.isDeafened;
    element.srcObject = new MediaStream([track]);
    applyRemoteAudioVolume(element, identity);
    const outputDeviceId = voiceDeviceSettingsStore.outputDeviceId;
    if (outputDeviceId) getResultAsync(() => element.setSinkId(outputDeviceId)).match(noop, console.error);
    remoteAudioElements.set(key, { element, identity });
    window.document.body.append(element);
    playRemoteAudio(element);
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
    meeting.self.on("roomLeft", () => {
      connectionState.value = ConnectionState.Disconnected;
      onDisconnected();
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
    Promise.all([...remoteAudioElements.values()].map(({ element }) => playRemoteAudio(element)));
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
    if (virtualBackground && !hasVirtualBackground) await applyVirtualBackground(virtualBackground);
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
  // Local media pipeline work rather than a server write: clicking through the background picker means only
  // The last pick matters, and the picks before it have nothing to unwind, so they supersede rather than queue
  const applyVirtualBackground = async (virtualBackground: string) => {
    const outcome = await executeSetVirtualBackgroundMutation(
      async (checkIsStale) => {
        mediaStore.selectedVirtualBackground = virtualBackground;
        const meeting = activeMeeting;
        if (!meeting?.self.videoEnabled) return;
        else if (!RealtimeKitVideoBackgroundTransformer.isSupported()) {
          console.warn("Virtual backgrounds are not supported in this browser.");
          return;
        }

        // Held for this operation, since leaving the call or switching the camera off clears the store's ref while one
        // Of the awaits below is open. Once the store no longer points at this meeting, the operation has nothing left
        // To write to
        const checkIsCurrent = () => checkIsStale() || meeting !== activeMeeting;
        const transformer =
          videoBackgroundTransformer ?? (await RealtimeKitVideoBackgroundTransformer.init({ meeting }));
        // A transformer built for a meeting that has since been left belongs to nothing, so it is released here
        if (meeting !== activeMeeting) {
          transformer.destruct();
          return;
        }
        videoBackgroundTransformer = transformer;
        if (checkIsStale()) return;
        const imagePath = await readVirtualBackgroundImagePath(virtualBackground);
        if (checkIsCurrent()) return;
        else if (!imagePath) {
          // A slot that has been deleted resolves to nothing, which lands here as the same no-background the None entry
          // Selects - a missing image must never leave a call with a broken video track
          await meeting.self.removeAllVideoMiddlewares();
          hasVirtualBackground = false;
          setLocalVideo(meeting.self);
          return;
        }
        // Only the presets are SVGs; an uploaded slot arrives as a signed url the middleware can take directly
        const resolvedPath = imagePath.endsWith(".svg") ? await rasterizeSvg(imagePath) : imagePath;
        if (checkIsCurrent() || !resolvedPath) return;
        const middleware = await transformer.createStaticBackgroundVideoMiddleware(resolvedPath);
        if (checkIsCurrent()) return;
        // The middleware is replaced rather than stacked, so one pick never composites over another
        await meeting.self.removeAllVideoMiddlewares();
        await meeting.self.addVideoMiddleware(middleware);
        hasVirtualBackground = true;
        setLocalVideo(meeting.self);
      },
      { isSupersede: true, key: "virtualBackground" },
    );
    return outcome.status === MutationStatus.Succeeded;
  };
  // The pick the user actually made, which is the only one worth remembering. Persisted after the pipeline has
  // Taken it, and only if it is still the pick in force: these supersede rather than queue, so a slow
  // Selection can resolve after a later one has already applied - writing it then would leave the settings row
  // Naming a background the call is not showing, and restore it on the next camera start
  const setVirtualBackground = async (virtualBackground: string) => {
    const isVirtualBackgroundApplied = await applyVirtualBackground(virtualBackground);
    if (isVirtualBackgroundApplied) await updateUserSettings({ virtualBackground });
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
    newDisconnectHandler: () => Promise<void>,
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
    await meeting.join();
    // Participants already in the meeting are attached here, and the listeners that follow are registered in the same
    // Tick, so no join or leave can land between the two
    for (const participant of meeting.participants.joined.values()) attachRemoteParticipant(participant);
    meeting.participants.joined.on("participantJoined", attachRemoteParticipant);
    meeting.participants.joined.on("participantLeft", detachRemoteParticipant);
    // The picks are applied while the microphone and camera are still off, so nothing is captured on the default first
    for (const kind of VoiceDeviceKinds)
      await syncDeviceToMeeting(kind, voiceDeviceSettingsStore[VoiceDeviceSettingsKeyMap[kind]]);
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
