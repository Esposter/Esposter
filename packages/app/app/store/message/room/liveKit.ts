import type {
  LocalTrackPublication,
  LocalVideoTrack,
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
} from "livekit-client";

import { getConcurrentFunction } from "#shared/util/function/getConcurrentFunction";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { MicrophoneProcessor } from "@/models/message/room/call/MicrophoneProcessor";
import { getAudioCaptureDefaults } from "@/services/message/room/call/getAudioCaptureDefaults";
import { checkIsRemoteAudioSource } from "@/services/message/room/liveKit/checkIsRemoteAudioSource";
import { rasterizeSvg } from "@/services/message/room/liveKit/rasterizeSvg";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { useUserSettingsStore } from "@/store/message/user/settings";
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";
import { DEFAULT_SPEAKER_VOLUME_PERCENTAGE, NoiseSuppressionMode, VoiceInputMode } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";
import { BackgroundProcessor, supportsBackgroundProcessors } from "@livekit/track-processors";
import { ConnectionQuality, ConnectionState, Room, RoomEvent, Track } from "livekit-client";

export const useLiveKitStore = defineStore("message/room/liveKit", () => {
  let activeRoom: Room | undefined;
  let disconnectHandler: (() => Promise<void>) | undefined;
  let localCameraTrack: LocalVideoTrack | undefined;
  let microphoneProcessor: MicrophoneProcessor | undefined;
  let virtualBackgroundProcessor: ReturnType<typeof BackgroundProcessor> | undefined;
  const mediaStore = useMediaStore();
  const { setLocalScreenShareStream, setRemoteScreenShareStream, setRemoteVideoStream } = mediaStore;
  const participantStore = useParticipantStore();
  const userSettingsStore = useUserSettingsStore();
  // Persisted (localStorage) device selections are the single source of truth, shared with the settings
  // Panel, mic test, and pre-join preview - so the call captures the device the user actually picked.
  const voiceDeviceSettingsStore = useVoiceDeviceSettingsStore();
  const remoteAudioElements = new Map<string, HTMLMediaElement>();
  const connectionQuality = ref(ConnectionQuality.Unknown);
  const connectionState = ref(ConnectionState.Disconnected);
  const cleanupRemoteAudio = () => {
    for (const audio of remoteAudioElements.values()) audio.remove();
    remoteAudioElements.clear();
  };
  const setActiveSpeakers = (speakers: { identity: string }[]) => {
    participantStore.speakingIds = speakers.map(({ identity }) => identity);
  };
  const setRemoteAudioMuted = (isDeafened: boolean) => {
    for (const audio of remoteAudioElements.values()) audio.muted = isDeafened;
  };
  // Master output volume — HTMLMediaElement.volume caps at 1, so values above 100% clamp to full.
  const applyRemoteAudioVolume = (element: HTMLMediaElement) => {
    const percentage = userSettingsStore.userSettings?.speakerVolumePercentage ?? DEFAULT_SPEAKER_VOLUME_PERCENTAGE;
    element.volume = Math.min(1, percentage / 100);
  };
  const setSpeakerVolume = () => {
    for (const audio of remoteAudioElements.values()) applyRemoteAudioVolume(audio);
  };
  const setNoiseSuppressionMode = getSynchronizedFunction(async (noiseSuppressionMode: NoiseSuppressionMode) => {
    if (!activeRoom) return;
    const microphonePublication = activeRoom.localParticipant.getTrackPublication(Track.Source.Microphone);
    await microphonePublication?.audioTrack?.restartTrack(getAudioCaptureDefaults(noiseSuppressionMode));
  });
  const applyMicrophoneSettings = () => {
    const settings = userSettingsStore.userSettings;
    if (!microphoneProcessor || !settings) return;
    microphoneProcessor.inputSensitivityDecibels = settings.inputSensitivityDecibels;
    microphoneProcessor.isVoiceActivity = settings.voiceInputMode === VoiceInputMode.VoiceActivity;
    microphoneProcessor.microphoneVolumePercentage = settings.microphoneVolumePercentage;
  };
  const setActiveDevice = (kind: MediaDeviceKind, deviceId: string) => {
    switch (kind) {
      case "audioinput":
        voiceDeviceSettingsStore.inputDeviceId = deviceId;
        break;
      case "audiooutput":
        voiceDeviceSettingsStore.outputDeviceId = deviceId;
        break;
      case "videoinput":
        voiceDeviceSettingsStore.cameraDeviceId = deviceId;
        break;
      default:
        exhaustiveGuard(kind);
    }
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
    applyRemoteAudioVolume(element);
    remoteAudioElements.set(`${participant.identity}:${publication.source}`, element);
    window.document.body.append(element);
  };
  const detachRemoteAudio = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (!checkIsRemoteAudioSource(publication.source)) return;
    for (const element of track.detach()) element.remove();
    remoteAudioElements.delete(`${participant.identity}:${publication.source}`);
  };
  const attachRemoteCamera = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (publication.source !== Track.Source.Camera || !track.mediaStream) return;
    setRemoteVideoStream(participant.identity, track.mediaStream);
  };
  const detachRemoteCamera = (
    _track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (publication.source !== Track.Source.Camera) return;
    setRemoteVideoStream(participant.identity, null);
  };
  const attachRemoteScreenShare = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (publication.source !== Track.Source.ScreenShare || !track.mediaStream) return;
    setRemoteScreenShareStream(participant.identity, track.mediaStream);
  };
  const detachRemoteScreenShare = (
    _track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (publication.source !== Track.Source.ScreenShare) return;
    setRemoteScreenShareStream(participant.identity, null);
  };
  const setLocalCameraTrack = async (publication: LocalTrackPublication | undefined) => {
    if (!publication?.videoTrack) {
      if (localCameraTrack?.getProcessor()) await localCameraTrack.stopProcessor();
      virtualBackgroundProcessor = undefined;
      localCameraTrack = undefined;
      mediaStore.localVideoStream = null;
      mediaStore.isCameraEnabled = false;
      return;
    }

    localCameraTrack = publication.videoTrack;
    mediaStore.localVideoStream = publication.videoTrack.mediaStream ?? null;
    mediaStore.isCameraEnabled = true;
    if (mediaStore.selectedVirtualBackground) await setVirtualBackground(mediaStore.selectedVirtualBackground);
  };
  const onLocalTrackPublished = getSynchronizedFunction(async (publication: LocalTrackPublication) => {
    if (publication.source === Track.Source.Camera) await setLocalCameraTrack(publication);
    else if (publication.source === Track.Source.ScreenShare) {
      setLocalScreenShareStream(publication.track?.mediaStream ?? null);
      mediaStore.isScreenSharing = true;
    } else if (publication.source === Track.Source.Microphone && publication.audioTrack) {
      microphoneProcessor = new MicrophoneProcessor();
      applyMicrophoneSettings();
      await publication.audioTrack.setProcessor(microphoneProcessor);
    }
  });
  const onLocalTrackUnpublished = getSynchronizedFunction(async (publication: LocalTrackPublication) => {
    if (publication.source === Track.Source.Camera) await setLocalCameraTrack(undefined);
    else if (publication.source === Track.Source.ScreenShare) {
      setLocalScreenShareStream(null);
      mediaStore.isScreenSharing = false;
    } else if (publication.source === Track.Source.Microphone) microphoneProcessor = undefined;
  });
  const onDisconnected = getSynchronizedFunction(async () => {
    const handler = disconnectHandler;
    disconnectHandler = undefined;
    await handler?.();
  });
  const onAudioPlaybackStatusChanged = () => {
    if (activeRoom && !activeRoom.canPlaybackAudio)
      console.warn("Audio autoplay blocked — browser requires user interaction to start audio.");
  };
  const setCamera = async (isCameraEnabled: boolean) => {
    if (!activeRoom) return;
    if (!isCameraEnabled) {
      mediaStore.localVideoStream = null;
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
    await activeRoom.localParticipant.setScreenShareEnabled(isScreenSharing, {
      audio: true,
      resolution: { frameRate: 15, height: 1080, width: 1920 },
      selfBrowserSurface: "exclude",
      surfaceSwitching: "include",
    });
    mediaStore.isScreenSharing = isScreenSharing;
    if (!isScreenSharing) setLocalScreenShareStream(null);
  };
  const setVirtualBackground = getConcurrentFunction(async (checkIsStale, imagePath: string) => {
    mediaStore.selectedVirtualBackground = imagePath;
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
    if (!imagePath) {
      if (checkIsStale()) return;
      await virtualBackgroundProcessor.switchTo({ mode: "disabled" });
      return;
    }

    const resolvedPath = imagePath.endsWith(".svg") ? await rasterizeSvg(imagePath) : imagePath;
    if (checkIsStale() || !resolvedPath) return;
    await virtualBackgroundProcessor.switchTo({ imagePath: resolvedPath, mode: "virtual-background" });
  });
  // Selecting a device just writes the persisted ref (via setActiveDevice); these watchers restart the
  // Live track on change. The guard skips no-op switches - including the echo from LiveKit's own
  // ActiveDeviceChanged event - so there is no feedback loop.
  const syncDeviceToRoom = getSynchronizedFunction(async (kind: MediaDeviceKind, deviceId: string) => {
    if (!activeRoom || !deviceId || activeRoom.getActiveDevice(kind) === deviceId) return;
    await activeRoom.switchActiveDevice(kind, deviceId);
  });
  watch(
    () => voiceDeviceSettingsStore.inputDeviceId,
    (deviceId) => {
      syncDeviceToRoom("audioinput", deviceId);
    },
  );
  watch(
    () => voiceDeviceSettingsStore.outputDeviceId,
    (deviceId) => {
      syncDeviceToRoom("audiooutput", deviceId);
    },
  );
  watch(
    () => voiceDeviceSettingsStore.cameraDeviceId,
    (deviceId) => {
      syncDeviceToRoom("videoinput", deviceId);
    },
  );
  const syncActiveDevices = (room: Room) => {
    for (const kind of ["audioinput", "audiooutput", "videoinput"] as const) {
      const deviceId = room.getActiveDevice(kind);
      if (deviceId) setActiveDevice(kind, deviceId);
    }
  };
  const connect = async (
    room: Room,
    livekitUrl: string,
    livekitToken: string,
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
    await room.connect(livekitUrl, livekitToken);
    connectionQuality.value = room.localParticipant.connectionQuality;
    connectionState.value = room.state;
    await room.localParticipant.setMicrophoneEnabled(isMicrophoneEnabled);
    syncActiveDevices(room);
  };
  const disconnect = async () => {
    const room = activeRoom;
    activeRoom = undefined;
    disconnectHandler = undefined;
    await localCameraTrack?.stopProcessor();
    await room?.disconnect();
    localCameraTrack = undefined;
    microphoneProcessor = undefined;
    virtualBackgroundProcessor = undefined;
    connectionQuality.value = ConnectionQuality.Unknown;
    connectionState.value = ConnectionState.Disconnected;
    cleanupRemoteAudio();
  };
  watch(() => userSettingsStore.userSettings?.speakerVolumePercentage, setSpeakerVolume);
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
    setRemoteAudioMuted,
    setScreenShare,
    setVirtualBackground,
  };
});
