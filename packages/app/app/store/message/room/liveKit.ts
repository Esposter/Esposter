import type { RemoteParticipant, RemoteTrack, RemoteTrackPublication, Room, TrackPublication } from "livekit-client";

import { getSynchronizedFunction } from "#shared/error/getSynchronizedFunction";
import { useCallStore } from "@/store/message/room/call";
import { RoomEvent, Track } from "livekit-client";

let activeRoom: Room | undefined;
const remoteAudioElements = new Map<string, HTMLMediaElement>();

export const useLiveKitStore = defineStore("message/room/liveKit", () => {
  const cleanupRemoteAudio = () => {
    for (const audio of remoteAudioElements.values()) audio.remove();
    remoteAudioElements.clear();
  };
  const setActiveSpeakers = (speakers: { identity: string }[]) => {
    callStore.speakingIds = speakers.map(({ identity }) => identity);
  };
  const setRemoteAudioMuted = (isDeafened: boolean) => {
    for (const audio of remoteAudioElements.values()) audio.muted = isDeafened;
  };
  const attachRemoteAudio = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (publication.source !== Track.Source.Microphone) return;
    const element = track.attach();
    element.autoplay = true;
    element.muted = callStore.isDeafened;
    remoteAudioElements.set(participant.identity, element);
    window.document.body.append(element);
  };
  const detachRemoteAudio = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ) => {
    if (publication.source !== Track.Source.Microphone) return;
    for (const element of track.detach()) element.remove();
    remoteAudioElements.delete(participant.identity);
  };
  const setCamera = async (isCameraEnabled: boolean) => {
    if (!activeRoom) return;
    await activeRoom.localParticipant.setCameraEnabled(isCameraEnabled);
  };
  const setMicrophone = async (isMicrophoneEnabled: boolean) => {
    if (!activeRoom) return;
    await activeRoom.localParticipant.setMicrophoneEnabled(isMicrophoneEnabled);
  };
  const connect = async (room: Room, livekitUrl: string, livekitToken: string) => {
    activeRoom?.disconnect();
    cleanupRemoteAudio();
    activeRoom = room;
    room.on(RoomEvent.ActiveSpeakersChanged, setActiveSpeakers);
    room.on(RoomEvent.TrackSubscribed, attachRemoteAudio);
    room.on(RoomEvent.TrackUnsubscribed, detachRemoteAudio);
    room.on(
      RoomEvent.LocalTrackPublished,
      getSynchronizedFunction(async (publication: TrackPublication) => {
        if (publication.source !== Track.Source.Camera) return;
        const callStore = useCallStore();
        await callStore.setCameraEnabled(true);
      }),
    );
    room.on(
      RoomEvent.LocalTrackUnpublished,
      getSynchronizedFunction(async (publication: TrackPublication) => {
        if (publication.source !== Track.Source.Camera) return;
        const callStore = useCallStore();
        await callStore.setCameraEnabled(false);
      }),
    );
    await room.connect(livekitUrl, livekitToken);
    await room.localParticipant.setMicrophoneEnabled(true);
  };
  const disconnect = async () => {
    activeRoom?.disconnect();
    activeRoom = undefined;
    cleanupRemoteAudio();
  };
  return {
    connect,
    disconnect,
    setCamera,
    setMicrophone,
    setRemoteAudioMuted,
  };
});
