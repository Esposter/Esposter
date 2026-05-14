import type { LocalTrackPublication, RemoteParticipant, RemoteTrack, RemoteTrackPublication } from "livekit-client";

import { getSynchronizedFunction } from "#shared/error/getSynchronizedFunction";
import { useCallStore } from "@/store/message/room/call";
import { exhaustiveGuard } from "@esposter/shared";
import { Room, RoomEvent, Track } from "livekit-client";

export const useLiveKitStore = defineStore("message/room/liveKit", () => {
  let activeRoom: Room | undefined;
  const remoteAudioElements = new Map<string, HTMLMediaElement>();
  const selectedAudioInputDeviceId = ref("");
  const selectedAudioOutputDeviceId = ref("");
  const selectedVideoInputDeviceId = ref("");
  const cleanupRemoteAudio = () => {
    for (const audio of remoteAudioElements.values()) audio.remove();
    remoteAudioElements.clear();
  };
  const setActiveSpeakers = (speakers: { identity: string }[]) => {
    const callStore = useCallStore();
    callStore.speakingIds = speakers.map(({ identity }) => identity);
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
  const isRemoteAudioSource = (source: Track.Source) =>
    [Track.Source.Microphone, Track.Source.ScreenShareAudio].includes(source);
  const attachRemoteAudio = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (!isRemoteAudioSource(publication.source)) return;
    const callStore = useCallStore();
    const element = track.attach();
    element.autoplay = true;
    element.muted = callStore.isDeafened;
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
    const callStore = useCallStore();
    const { setRemoteVideoStream } = callStore;
    setRemoteVideoStream(participant.identity, track.mediaStream);
  };
  const detachRemoteCamera = (
    _track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (publication.source !== Track.Source.Camera) return;
    const callStore = useCallStore();
    const { setRemoteVideoStream } = callStore;
    setRemoteVideoStream(participant.identity, null);
  };
  const attachRemoteScreenShare = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (publication.source !== Track.Source.ScreenShare || !track.mediaStream) return;
    const callStore = useCallStore();
    const { setRemoteScreenShareStream } = callStore;
    setRemoteScreenShareStream(participant.identity, track.mediaStream);
  };
  const detachRemoteScreenShare = (
    _track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (publication.source !== Track.Source.ScreenShare) return;
    const callStore = useCallStore();
    const { setRemoteScreenShareStream } = callStore;
    setRemoteScreenShareStream(participant.identity, null);
  };
  const onLocalTrackPublished = getSynchronizedFunction(async (publication: LocalTrackPublication) => {
    const callStore = useCallStore();
    const { setCameraEnabled, setLocalScreenShareStream, setLocalVideoStream, setScreenSharing } = callStore;
    if (publication.source === Track.Source.Camera) {
      setLocalVideoStream(publication.track?.mediaStream ?? null);
      await setCameraEnabled(true);
    } else if (publication.source === Track.Source.ScreenShare) {
      setLocalScreenShareStream(publication.track?.mediaStream ?? null);
      setScreenSharing(true);
    }
  });
  const onLocalTrackUnpublished = getSynchronizedFunction(async (publication: LocalTrackPublication) => {
    const callStore = useCallStore();
    const { setCameraEnabled, setLocalScreenShareStream, setLocalVideoStream, setScreenSharing } = callStore;
    if (publication.source === Track.Source.Camera) {
      setLocalVideoStream(null);
      await setCameraEnabled(false);
    } else if (publication.source === Track.Source.ScreenShare) {
      setLocalScreenShareStream(null);
      setScreenSharing(false);
    }
  });
  const onDisconnected = getSynchronizedFunction(async () => {
    const callStore = useCallStore();
    const { leaveCall } = callStore;
    await leaveCall();
  });
  const onAudioPlaybackStatusChanged = () => {
    if (activeRoom && !activeRoom.canPlaybackAudio)
      console.warn("Audio autoplay blocked — browser requires user interaction to start audio.");
  };
  const setCamera = async (isCameraEnabled: boolean) => {
    if (!activeRoom) return;
    await activeRoom.localParticipant.setCameraEnabled(isCameraEnabled);
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
  };
  const readDevices = (kind: MediaDeviceKind) => Room.getLocalDevices(kind);
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
  const connect = async (room: Room, livekitUrl: string, livekitToken: string) => {
    await activeRoom?.disconnect();
    cleanupRemoteAudio();
    activeRoom = room;
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
    await room.localParticipant.setMicrophoneEnabled(true);
    syncActiveDevices(room);
  };
  const disconnect = async () => {
    await activeRoom?.disconnect();
    activeRoom = undefined;
    cleanupRemoteAudio();
  };
  return {
    connect,
    disconnect,
    readDevices,
    selectedAudioInputDeviceId,
    selectedAudioOutputDeviceId,
    selectedVideoInputDeviceId,
    setCamera,
    setMicrophone,
    setRemoteAudioMuted,
    setScreenShare,
    switchDevice,
  };
});
