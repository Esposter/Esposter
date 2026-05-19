import type {
  LocalTrackPublication,
  LocalVideoTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
} from "livekit-client";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { isRemoteAudioSource } from "@/services/message/room/liveKit/isRemoteAudioSource";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { exhaustiveGuard, getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { BackgroundProcessor, supportsBackgroundProcessors } from "@livekit/track-processors";
import { Room, RoomEvent, Track } from "livekit-client";

const rasterizedSvgCache = new Map<string, string>();

const rasterizeSvg = (svgUrl: string) =>
  getResultAsync(async () => {
    const cachedRasterizedSvgUrl = rasterizedSvgCache.get(svgUrl);
    if (cachedRasterizedSvgUrl) return cachedRasterizedSvgUrl;

    const svgResponse = await fetch(svgUrl);
    const svgBlob = await svgResponse.blob();
    const svgImageBitmap = await createImageBitmap(svgBlob);
    const rasterizationCanvas = document.createElement("canvas");
    rasterizationCanvas.width = 1920;
    rasterizationCanvas.height = 1080;
    rasterizationCanvas.getContext("2d")?.drawImage(svgImageBitmap, 0, 0, 1920, 1080);
    svgImageBitmap.close();

    const rasterizedSvgBlobUrl = await new Promise<string>((resolve, reject) => {
      rasterizationCanvas.toBlob((rasterizedSvgBlob) => {
        if (!rasterizedSvgBlob) {
          reject(new InvalidOperationError(Operation.Create, svgUrl, "Canvas toBlob returned null"));
          return;
        }
        resolve(URL.createObjectURL(rasterizedSvgBlob));
      }, "image/png");
    });

    rasterizedSvgCache.set(svgUrl, rasterizedSvgBlobUrl);
    return rasterizedSvgBlobUrl;
  }).match(
    (rasterizedSvgBlobUrl) => rasterizedSvgBlobUrl,
    (error) => {
      console.error(error);
      return null;
    },
  );

export const useLiveKitStore = defineStore("message/room/liveKit", () => {
  let activeRoom: Room | undefined;
  let disconnectHandler: (() => Promise<void>) | undefined;
  let localCameraTrack: LocalVideoTrack | undefined;
  let virtualBackgroundProcessor: ReturnType<typeof BackgroundProcessor> | undefined;
  const mediaStore = useMediaStore();
  const { setLocalScreenShareStream, setRemoteScreenShareStream, setRemoteVideoStream } = mediaStore;
  const participantStore = useParticipantStore();
  const remoteAudioElements = new Map<string, HTMLMediaElement>();
  const selectedAudioInputDeviceId = ref("");
  const selectedAudioOutputDeviceId = ref("");
  const selectedVideoInputDeviceId = ref("");
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
  const setActiveDevice = (kind: MediaDeviceKind, deviceId: string) => {
    switch (kind) {
      case "audioinput":
        selectedAudioInputDeviceId.value = deviceId;
        break;
      case "audiooutput":
        selectedAudioOutputDeviceId.value = deviceId;
        break;
      case "videoinput":
        selectedVideoInputDeviceId.value = deviceId;
        break;
      default:
        exhaustiveGuard(kind);
    }
  };
  const attachRemoteAudio = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (!isRemoteAudioSource(publication.source)) return;
    const element = track.attach();
    element.autoplay = true;
    element.muted = mediaStore.isDeafened;
    remoteAudioElements.set(`${participant.identity}:${publication.source}`, element);
    window.document.body.append(element);
  };
  const detachRemoteAudio = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (!isRemoteAudioSource(publication.source)) return;
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
    }
  });
  const onLocalTrackUnpublished = getSynchronizedFunction(async (publication: LocalTrackPublication) => {
    if (publication.source === Track.Source.Camera) await setLocalCameraTrack(undefined);
    else if (publication.source === Track.Source.ScreenShare) {
      setLocalScreenShareStream(null);
      mediaStore.isScreenSharing = false;
    }
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
  const setVirtualBackground = async (imagePath: string) => {
    mediaStore.selectedVirtualBackground = imagePath;
    if (!localCameraTrack) return;
    else if (!supportsBackgroundProcessors()) {
      console.warn("Background processors are not supported in this browser.");
      return;
    }

    virtualBackgroundProcessor ??= BackgroundProcessor({ mode: "disabled" });
    if (!localCameraTrack.getProcessor()) {
      await localCameraTrack.setProcessor(virtualBackgroundProcessor);
      if (virtualBackgroundProcessor.processedTrack)
        mediaStore.localVideoStream = new MediaStream([virtualBackgroundProcessor.processedTrack]);
    }
    if (!imagePath) {
      await virtualBackgroundProcessor.switchTo({ mode: "disabled" });
      return;
    }

    const resolvedPath = imagePath.endsWith(".svg") ? await rasterizeSvg(imagePath) : imagePath;
    if (!resolvedPath) return;
    await virtualBackgroundProcessor.switchTo({ imagePath: resolvedPath, mode: "virtual-background" });
  };
  const switchDevice = async (kind: MediaDeviceKind, deviceId: string) => {
    if (!activeRoom) {
      setActiveDevice(kind, deviceId);
      return;
    }

    await activeRoom.switchActiveDevice(kind, deviceId);
  };
  const syncActiveDevices = (room: Room) => {
    selectedAudioInputDeviceId.value = room.getActiveDevice("audioinput") ?? "";
    selectedAudioOutputDeviceId.value = room.getActiveDevice("audiooutput") ?? "";
    selectedVideoInputDeviceId.value = room.getActiveDevice("videoinput") ?? "";
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
    room.on(RoomEvent.ActiveSpeakersChanged, setActiveSpeakers);
    room.on(RoomEvent.ActiveDeviceChanged, setActiveDevice);
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
    virtualBackgroundProcessor = undefined;
    cleanupRemoteAudio();
  };
  return {
    connect,
    disconnect,
    selectedAudioInputDeviceId,
    selectedAudioOutputDeviceId,
    selectedVideoInputDeviceId,
    setCamera,
    setMicrophone,
    setRemoteAudioMuted,
    setScreenShare,
    setVirtualBackground,
    switchDevice,
  };
});
