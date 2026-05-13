import type { LocalTrackPublication, RemoteParticipant, RemoteTrack, RemoteTrackPublication } from "livekit-client";

import { getSynchronizedFunction } from "#shared/error/getSynchronizedFunction";
import { useCallStore } from "@/store/message/room/call";
import { Room, RoomEvent, Track } from "livekit-client";
import { exhaustiveGuard } from "@esposter/shared";

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
    useCallStore().setRemoteVideoStream(participant.identity, track.mediaStream);
  };
  const detachRemoteCamera = (
    _track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (publication.source !== Track.Source.Camera) return;
    useCallStore().setRemoteVideoStream(participant.identity, null);
  };
  const attachRemoteScreenShare = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (publication.source !== Track.Source.ScreenShare || !track.mediaStream) return;
    useCallStore().setRemoteScreenShareStream(participant.identity, track.mediaStream);
  };
  const detachRemoteScreenShare = (
    _track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (publication.source !== Track.Source.ScreenShare) return;
    useCallStore().setRemoteScreenShareStream(participant.identity, null);
  };
  const handleLocalTrackPublished = getSynchronizedFunction(async (publication: LocalTrackPublication) => {
    const callStore = useCallStore();
    if (publication.source === Track.Source.Camera) {
      callStore.setLocalVideoStream(publication.track?.mediaStream ?? null);
      await callStore.setCameraEnabled(true);
    } else if (publication.source === Track.Source.ScreenShare) {
      callStore.setLocalScreenShareStream(publication.track?.mediaStream ?? null);
      callStore.setScreenSharing(true);
    }
  });
  const handleLocalTrackUnpublished = getSynchronizedFunction(async (publication: LocalTrackPublication) => {
    const callStore = useCallStore();
    if (publication.source === Track.Source.Camera) {
      callStore.setLocalVideoStream(null);
      await callStore.setCameraEnabled(false);
    } else if (publication.source === Track.Source.ScreenShare) {
      callStore.setLocalScreenShareStream(null);
      callStore.setScreenSharing(false);
    }
  });
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
    room.on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);
    room.on(RoomEvent.LocalTrackUnpublished, handleLocalTrackUnpublished);
    room.on(
      RoomEvent.Disconnected,
      getSynchronizedFunction(async () => {
        const callStore = useCallStore();
        await callStore.leaveCall();
      }),
    );
    room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
      if (!room.canPlaybackAudio)
        console.warn("Audio autoplay blocked — browser requires user interaction to start audio.");
    });
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
