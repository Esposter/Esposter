import type {
  LocalTrackPublication,
  LocalVideoTrack,
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
} from "livekit-client";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { MicrophoneProcessor } from "@/models/message/room/call/MicrophoneProcessor";
import { MutationStatus } from "@/models/shared/MutationStatus";
import { DEFAULT_PARTICIPANT_VOLUME_PERCENTAGE } from "@/services/message/room/call/constants";
import { getAudioCaptureDefaults } from "@/services/message/room/call/getAudioCaptureDefaults";
import { checkIsRemoteAudioSource } from "@/services/message/room/liveKit/checkIsRemoteAudioSource";
import { getRemoteAudioElementKey } from "@/services/message/room/liveKit/getRemoteAudioElementKey";
import { rasterizeSvg } from "@/services/message/room/liveKit/rasterizeSvg";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { useUserSettingsStore } from "@/store/message/user/settings";
import { useCallBackgroundStore } from "@/store/message/user/settings/callBackground";
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voiceDevice";
import {
  DEFAULT_PUSH_TO_TALK_RELEASE_DELAY_MS,
  DEFAULT_SPEAKER_VOLUME_PERCENTAGE,
  NoiseSuppressionMode,
  VoiceInputMode,
} from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { BackgroundProcessor, supportsBackgroundProcessors } from "@livekit/track-processors";
import { ConnectionQuality, ConnectionState, Room, RoomEvent, Track } from "livekit-client";

// Which persisted selection each LiveKit device kind writes to, so writing a pick, restarting the live track on
// A change, and syncing back what the room reports all read one declaration instead of three parallel ones
const VoiceDeviceSettingsKeyMap = {
  audioinput: "inputDeviceId",
  audiooutput: "outputDeviceId",
  videoinput: "cameraDeviceId",
} as const satisfies Record<MediaDeviceKind, string>;
// `Object.keys` widens to `string`, and every kind here is handed straight to LiveKit's device API, which takes
// A `MediaDeviceKind`
const VoiceDeviceKinds = Object.keys(VoiceDeviceSettingsKeyMap) as MediaDeviceKind[];
// Camera and screen share arrive on the same two events and differ only in the source they answer to and the
// Stream they set, so one factory declares both directions for each
const getRemoteStreamHandlers = (
  source: Track.Source,
  setStream: (identity: string, stream: MediaStream | undefined) => void,
) => ({
  attach: (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    if (publication.source !== source || !track.mediaStream) return;
    setStream(participant.identity, track.mediaStream);
  },
  detach: (_track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
    if (publication.source !== source) return;
    setStream(participant.identity, undefined);
  },
});
// Presentation-quality capture: full HD, at a frame rate that keeps slides and code legible without saturating
// The uplink, and never offering the tab doing the sharing as a surface to share
const SCREEN_SHARE_CAPTURE_OPTIONS = {
  audio: true,
  resolution: { frameRate: 15, height: 1080, width: 1920 },
  selfBrowserSurface: "exclude",
  surfaceSwitching: "include",
} as const;

export const useLiveKitStore = defineStore("message/room/liveKit", () => {
  let activeRoom: Room | undefined;
  let disconnectHandler: (() => Promise<void>) | undefined;
  let localCameraTrack: LocalVideoTrack | undefined;
  let microphoneProcessor: MicrophoneProcessor | undefined;
  let pushToTalkReleaseTimeoutId: number | undefined;
  let virtualBackgroundProcessor: ReturnType<typeof BackgroundProcessor> | undefined;
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
  const remoteAudioElements = new Map<string, { element: HTMLMediaElement; identity: string }>();
  const connectionQuality = ref(ConnectionQuality.Unknown);
  const connectionState = ref(ConnectionState.Disconnected);
  const clearRemoteAudio = () => {
    for (const { element } of remoteAudioElements.values()) element.remove();
    remoteAudioElements.clear();
  };
  const setActiveSpeakers = (speakers: { identity: string }[]) => {
    participantStore.speakingIds = speakers.map(({ identity }) => identity);
  };
  const setRemoteAudioMuted = (isDeafened: boolean) => {
    for (const { element } of remoteAudioElements.values()) element.muted = isDeafened;
  };
  // Master output volume × per-participant multiplier — HTMLMediaElement.volume caps at 1,
  // So combined values above 100% clamp to full.
  const applyRemoteAudioVolume = (element: HTMLMediaElement, identity: string) => {
    const speakerVolumePercentage =
      userSettingsStore.userSettings?.speakerVolumePercentage ?? DEFAULT_SPEAKER_VOLUME_PERCENTAGE;
    const participantVolumePercentage =
      mediaStore.participantVolumePercentageMap.get(identity) ?? DEFAULT_PARTICIPANT_VOLUME_PERCENTAGE;
    element.volume = Math.min(1, (speakerVolumePercentage / 100) * (participantVolumePercentage / 100));
  };
  const applySpeakerVolume = () => {
    for (const { element, identity } of remoteAudioElements.values()) applyRemoteAudioVolume(element, identity);
  };
  const setNoiseSuppressionMode = getSynchronizedFunction((noiseSuppressionMode: NoiseSuppressionMode) =>
    getResultAsync(async () => {
      if (!activeRoom) return;
      const microphonePublication = activeRoom.localParticipant.getTrackPublication(Track.Source.Microphone);
      await microphonePublication?.audioTrack?.restartTrack(getAudioCaptureDefaults(noiseSuppressionMode));
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
  const setConnectionQuality = (quality: ConnectionQuality, participant: Participant) => {
    if (participant.identity !== activeRoom?.localParticipant.identity) return;
    connectionQuality.value = quality;
  };
  const setConnectionState = (state: ConnectionState) => {
    connectionState.value = state;
  };
  const attachRemoteAudio = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (!checkIsRemoteAudioSource(publication.source)) return;
    const element = track.attach();
    element.autoplay = true;
    element.muted = mediaStore.isDeafened;
    applyRemoteAudioVolume(element, participant.identity);
    remoteAudioElements.set(getRemoteAudioElementKey(participant.identity, publication.source), {
      element,
      identity: participant.identity,
    });
    window.document.body.append(element);
  };
  const detachRemoteAudio = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (!checkIsRemoteAudioSource(publication.source)) return;
    for (const element of track.detach()) element.remove();
    remoteAudioElements.delete(getRemoteAudioElementKey(participant.identity, publication.source));
  };
  const { attach: attachRemoteCamera, detach: detachRemoteCamera } = getRemoteStreamHandlers(
    Track.Source.Camera,
    setRemoteVideoStream,
  );
  const { attach: attachRemoteScreenShare, detach: detachRemoteScreenShare } = getRemoteStreamHandlers(
    Track.Source.ScreenShare,
    setRemoteScreenShareStream,
  );
  const setLocalCameraTrack = async (publication: LocalTrackPublication | undefined) => {
    if (!publication?.videoTrack) {
      if (localCameraTrack?.getProcessor()) await localCameraTrack.stopProcessor();
      virtualBackgroundProcessor = undefined;
      localCameraTrack = undefined;
      mediaStore.localVideoStream = undefined;
      mediaStore.isCameraEnabled = false;
      return;
    }

    localCameraTrack = publication.videoTrack;
    mediaStore.localVideoStream = publication.videoTrack.mediaStream;
    mediaStore.isCameraEnabled = true;
    // The persisted pick is what a camera starting mid-call has to composite, because the ref is per-call and
    // A user who chose a background last session never touched the picker this one. Applied rather than set:
    // Restoring a selection is not the user making it again, so it owes the settings row no write
    const virtualBackground = mediaStore.selectedVirtualBackground || userSettingsStore.userSettings?.virtualBackground;
    if (virtualBackground) await applyVirtualBackground(virtualBackground);
  };
  const onLocalTrackPublished = getSynchronizedFunction((publication: LocalTrackPublication) =>
    getResultAsync(async () => {
      if (publication.source === Track.Source.Camera) await setLocalCameraTrack(publication);
      else if (publication.source === Track.Source.ScreenShare) {
        setLocalScreenShareStream(publication.track?.mediaStream);
        mediaStore.isScreenSharing = true;
      } else if (publication.source === Track.Source.Microphone && publication.audioTrack) {
        microphoneProcessor = new MicrophoneProcessor();
        applyMicrophoneSettings();
        await publication.audioTrack.setProcessor(microphoneProcessor);
      }
    }).match(noop, console.error),
  );
  const onLocalTrackUnpublished = getSynchronizedFunction((publication: LocalTrackPublication) =>
    getResultAsync(async () => {
      if (publication.source === Track.Source.Camera) await setLocalCameraTrack(undefined);
      else if (publication.source === Track.Source.ScreenShare) {
        setLocalScreenShareStream(undefined);
        mediaStore.isScreenSharing = false;
      } else if (publication.source === Track.Source.Microphone) microphoneProcessor = undefined;
    }).match(noop, console.error),
  );
  const onDisconnected = getSynchronizedFunction(() =>
    getResultAsync(async () => {
      const handler = disconnectHandler;
      disconnectHandler = undefined;
      await handler?.();
    }).match(noop, console.error),
  );
  const onAudioPlaybackStatusChanged = () => {
    if (activeRoom && !activeRoom.canPlaybackAudio)
      console.warn("Audio autoplay blocked — browser requires user interaction to start audio.");
  };
  const setCamera = async (isCameraEnabled: boolean) => {
    if (!activeRoom) return;
    if (!isCameraEnabled) {
      mediaStore.localVideoStream = undefined;
      await localCameraTrack?.stopProcessor();
      virtualBackgroundProcessor = undefined;
    }
    const publication = await activeRoom.localParticipant.setCameraEnabled(isCameraEnabled);
    await setLocalCameraTrack(isCameraEnabled ? publication : undefined);
  };
  const setMicrophone = async (isMicrophoneEnabled: boolean) => {
    if (!activeRoom) return;
    await activeRoom.localParticipant.setMicrophoneEnabled(isMicrophoneEnabled);
  };
  const setScreenShare = async (isScreenSharing: boolean) => {
    if (!activeRoom) return;
    await activeRoom.localParticipant.setScreenShareEnabled(isScreenSharing, SCREEN_SHARE_CAPTURE_OPTIONS);
    mediaStore.isScreenSharing = isScreenSharing;
    if (!isScreenSharing) setLocalScreenShareStream(undefined);
  };
  // Local media pipeline work rather than a server write: clicking through the background picker means only
  // The last pick matters, and the picks before it have nothing to unwind, so they supersede rather than queue
  const applyVirtualBackground = async (virtualBackground: string) => {
    const outcome = await executeSetVirtualBackgroundMutation(
      async (checkIsStale) => {
        mediaStore.selectedVirtualBackground = virtualBackground;
        if (!localCameraTrack) return;
        else if (!supportsBackgroundProcessors()) {
          console.warn("Background processors are not supported in this browser.");
          return;
        }

        virtualBackgroundProcessor ??= BackgroundProcessor({ mode: "disabled" });
        if (!localCameraTrack.getProcessor()) {
          await localCameraTrack.setProcessor(virtualBackgroundProcessor);
          if (checkIsStale()) return;
          if (virtualBackgroundProcessor.processedTrack)
            mediaStore.localVideoStream = new MediaStream([virtualBackgroundProcessor.processedTrack]);
        }
        // A slot that has been deleted resolves to nothing, which lands here as the same disabled processor the
        // None entry selects - a missing image must never leave a call with a broken video track
        const imagePath = await readVirtualBackgroundImagePath(virtualBackground);
        if (checkIsStale()) return;
        else if (!imagePath) {
          await virtualBackgroundProcessor.switchTo({ mode: "disabled" });
          return;
        }

        // Only the presets are SVGs; an uploaded slot arrives as a signed url the processor can take directly
        const resolvedPath = imagePath.endsWith(".svg") ? await rasterizeSvg(imagePath) : imagePath;
        if (checkIsStale() || !resolvedPath) return;
        await virtualBackgroundProcessor.switchTo({ imagePath: resolvedPath, mode: "virtual-background" });
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
  // Selecting a device just writes the persisted ref (via setActiveDevice); these watchers restart the
  // Live track on change. The guard skips no-op switches - including the echo from LiveKit's own
  // ActiveDeviceChanged event - so there is no feedback loop.
  const syncDeviceToRoom = getSynchronizedFunction((kind: MediaDeviceKind, deviceId: string) =>
    getResultAsync(async () => {
      if (!activeRoom || !deviceId || activeRoom.getActiveDevice(kind) === deviceId) return;
      await activeRoom.switchActiveDevice(kind, deviceId);
    }).match(noop, console.error),
  );
  for (const kind of VoiceDeviceKinds)
    watch(
      () => voiceDeviceSettingsStore[VoiceDeviceSettingsKeyMap[kind]],
      (deviceId) => {
        syncDeviceToRoom(kind, deviceId);
      },
    );
  const syncActiveDevices = (room: Room) => {
    for (const kind of VoiceDeviceKinds) {
      const deviceId = room.getActiveDevice(kind);
      if (deviceId) setActiveDevice(kind, deviceId);
    }
  };
  const connect = async (
    room: Room,
    liveKitUrl: string,
    liveKitToken: string,
    newDisconnectHandler: () => Promise<void>,
    isMicrophoneEnabled: boolean,
  ) => {
    await disconnect();
    activeRoom = room;
    disconnectHandler = newDisconnectHandler;
    connectionState.value = room.state;
    room.on(RoomEvent.ActiveSpeakersChanged, setActiveSpeakers);
    room.on(RoomEvent.ActiveDeviceChanged, setActiveDevice);
    room.on(RoomEvent.ConnectionQualityChanged, setConnectionQuality);
    room.on(RoomEvent.ConnectionStateChanged, setConnectionState);
    room.on(RoomEvent.TrackSubscribed, attachRemoteAudio);
    room.on(RoomEvent.TrackSubscribed, attachRemoteCamera);
    room.on(RoomEvent.TrackSubscribed, attachRemoteScreenShare);
    room.on(RoomEvent.TrackUnsubscribed, detachRemoteAudio);
    room.on(RoomEvent.TrackUnsubscribed, detachRemoteCamera);
    room.on(RoomEvent.TrackUnsubscribed, detachRemoteScreenShare);
    room.on(RoomEvent.LocalTrackPublished, onLocalTrackPublished);
    room.on(RoomEvent.LocalTrackUnpublished, onLocalTrackUnpublished);
    room.on(RoomEvent.Disconnected, onDisconnected);
    room.on(RoomEvent.AudioPlaybackStatusChanged, onAudioPlaybackStatusChanged);
    await room.connect(liveKitUrl, liveKitToken);
    connectionQuality.value = room.localParticipant.connectionQuality;
    connectionState.value = room.state;
    await room.localParticipant.setMicrophoneEnabled(isMicrophoneEnabled);
    syncActiveDevices(room);
  };
  const disconnect = async () => {
    const room = activeRoom;
    activeRoom = undefined;
    disconnectHandler = undefined;
    window.clearTimeout(pushToTalkReleaseTimeoutId);
    pushToTalkReleaseTimeoutId = undefined;
    await localCameraTrack?.stopProcessor();
    await room?.disconnect();
    localCameraTrack = undefined;
    microphoneProcessor = undefined;
    virtualBackgroundProcessor = undefined;
    connectionQuality.value = ConnectionQuality.Unknown;
    connectionState.value = ConnectionState.Disconnected;
    clearRemoteAudio();
  };
  watch(() => userSettingsStore.userSettings?.speakerVolumePercentage, applySpeakerVolume);
  watch(() => mediaStore.participantVolumePercentageMap, applySpeakerVolume, { deep: true });
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
    applyMicrophoneSettings,
  );

  return {
    connect,
    connectionQuality,
    connectionState,
    disconnect,
    setActiveDevice,
    setCamera,
    setMicrophone,
    setPushToTalkKeyHeld,
    setRemoteAudioMuted,
    setScreenShare,
    setVirtualBackground,
  };
});
