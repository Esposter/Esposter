import type { VoiceSignalPayload } from "#shared/models/room/voice/VoiceSignalPayload";

import { VoiceSignalType } from "#shared/models/room/voice/VoiceSignalType";
import { authClient } from "@/services/auth/authClient";
import { ICE_SERVERS, LOCAL_PARTICIPANT_ID, SPEAKING_THRESHOLD } from "@/services/message/voice/constants";
import { useRoomStore } from "@/store/message/room";
import { useVoiceStore } from "@/store/message/voice";
import { exhaustiveGuard } from "@esposter/shared";

export const useVoiceChannel = () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const voiceStore = useVoiceStore();
  const { addSpeakingUser, clearSpeakingUsers, joinVoice, leaveVoice, removeSpeakingUser, setMute, setParticipants } =
    voiceStore;
  const { speakingUserIds } = storeToRefs(voiceStore);
  const isInChannel = ref(false);
  const isMuted = ref(false);

  let localStream: MediaStream | null = null;
  const peerConnections = new Map<string, RTCPeerConnection>();
  const remoteAudioElements = new Map<string, HTMLAudioElement>();
  const speakingCleanups = new Map<string, () => void>();
  let signalUnsubscribable: undefined | { unsubscribe(): void };

  const cleanupPeer = (id: string) => {
    peerConnections.get(id)?.close();
    peerConnections.delete(id);
    remoteAudioElements.get(id)?.remove();
    remoteAudioElements.delete(id);
    speakingCleanups.get(id)?.();
    speakingCleanups.delete(id);
    removeSpeakingUser(id);
  };

  const cleanupLocalStream = () => {
    speakingCleanups.get(LOCAL_PARTICIPANT_ID)?.();
    speakingCleanups.delete(LOCAL_PARTICIPANT_ID);
    if (localStream) for (const track of localStream.getTracks()) track.stop();
    localStream = null;
  };

  const setupSpeakingDetection = (id: string, stream: MediaStream) => {
    if (!import.meta.client) return;
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    audioContext.createMediaStreamSource(stream).connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrame = 0;

    const detectSpeaking = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      const isSpeaking = average > SPEAKING_THRESHOLD;
      const isCurrentlySpeaking = speakingUserIds.value.includes(id);

      if (isSpeaking && !isCurrentlySpeaking) addSpeakingUser(id);
      else if (!isSpeaking && isCurrentlySpeaking) removeSpeakingUser(id);

      animationFrame = requestAnimationFrame(detectSpeaking);
    };

    animationFrame = requestAnimationFrame(detectSpeaking);
    speakingCleanups.set(id, () => {
      cancelAnimationFrame(animationFrame);
      void audioContext.close();
    });
  };

  const buildPeerConnection = (remoteId: string) => {
    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnections.set(remoteId, peerConnection);

    if (localStream) for (const track of localStream.getTracks()) peerConnection.addTrack(track, localStream);

    peerConnection.ontrack = ({ streams }) => {
      const remoteStream = streams[0];
      if (!remoteStream) return;
      setupSpeakingDetection(remoteId, remoteStream);
      const audio = new Audio();
      audio.srcObject = remoteStream;
      void audio.play();
      remoteAudioElements.set(remoteId, audio);
    };

    peerConnection.onicecandidate = ({ candidate }) => {
      if (!candidate || !currentRoomId.value) return;
      void $trpc.voice.sendSignal.mutate({
        payload: { data: JSON.stringify(candidate.toJSON()), targetUserId: remoteId, type: VoiceSignalType.Candidate },
        roomId: currentRoomId.value,
      });
    };

    return peerConnection;
  };

  const createPeerConnection = async (remoteId: string) => {
    if (!import.meta.client || !currentRoomId.value) return;

    const peerConnection = buildPeerConnection(remoteId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    await $trpc.voice.sendSignal.mutate({
      payload: { data: JSON.stringify(offer), targetUserId: remoteId, type: VoiceSignalType.Offer },
      roomId: currentRoomId.value,
    });
  };

  const handleSignal = async ({ payload, senderId }: { payload: VoiceSignalPayload; senderId: string }) => {
    if (!currentRoomId.value) return;
    const { data, type } = payload;

    switch (type) {
      case VoiceSignalType.Answer: {
        const peerConnection = peerConnections.get(senderId);
        if (!peerConnection) return;
        await peerConnection.setRemoteDescription(JSON.parse(data) as RTCSessionDescriptionInit);
        break;
      }
      case VoiceSignalType.Candidate: {
        const peerConnection = peerConnections.get(senderId);
        if (!peerConnection) return;
        await peerConnection.addIceCandidate(JSON.parse(data) as RTCIceCandidateInit);
        break;
      }
      case VoiceSignalType.Offer: {
        const peerConnection = buildPeerConnection(senderId);
        await peerConnection.setRemoteDescription(JSON.parse(data) as RTCSessionDescriptionInit);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        await $trpc.voice.sendSignal.mutate({
          payload: { data: JSON.stringify(answer), targetUserId: senderId, type: VoiceSignalType.Answer },
          roomId: currentRoomId.value,
        });
        break;
      }
      default:
        exhaustiveGuard(type);
    }
  };

  const join = async () => {
    if (!import.meta.client || !currentRoomId.value || isInChannel.value) return;

    const roomId = currentRoomId.value;
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    // Subscribe to signals before joining so we don't miss offers from existing participants
    signalUnsubscribable = $trpc.voice.onSignal.subscribe(roomId, { onData: handleSignal });

    const participants = await $trpc.voice.joinVoiceChannel.mutate({ roomId });
    isInChannel.value = true;
    setParticipants(roomId, participants);
    setupSpeakingDetection(LOCAL_PARTICIPANT_ID, localStream);
  };

  const leave = async () => {
    if (!currentRoomId.value || !isInChannel.value) return;

    const roomId = currentRoomId.value;
    const userId = session.value.data?.user.id;
    await $trpc.voice.leaveVoiceChannel.mutate({ roomId });
    isInChannel.value = false;
    isMuted.value = false;
    if (userId) leaveVoice(roomId, userId);

    for (const id of [...peerConnections.keys()]) cleanupPeer(id);
    cleanupLocalStream();
    signalUnsubscribable?.unsubscribe();
    signalUnsubscribable = undefined;
    clearSpeakingUsers();
  };

  const toggleMute = async () => {
    if (!localStream || !currentRoomId.value) return;

    isMuted.value = !isMuted.value;
    for (const track of localStream.getAudioTracks()) track.enabled = !isMuted.value;
    await $trpc.voice.setMute.mutate({ isMuted: isMuted.value, roomId: currentRoomId.value });
  };

  useOnlineSubscribable(currentRoomId, (roomId) => {
    if (!roomId) return;

    const participantJoinUnsubscribable = $trpc.voice.onParticipantJoin.subscribe(roomId, {
      onData: async (participant) => {
        joinVoice(roomId, participant);
        if (isInChannel.value) await createPeerConnection(participant.id);
      },
    });
    const participantLeaveUnsubscribable = $trpc.voice.onParticipantLeave.subscribe(roomId, {
      onData: (id) => {
        leaveVoice(roomId, id);
        cleanupPeer(id);
      },
    });
    const muteChangedUnsubscribable = $trpc.voice.onMuteChanged.subscribe(roomId, {
      onData: (muteChange) => setMute(roomId, muteChange.id, muteChange.isMuted),
    });

    return () => {
      const userId = session.value.data?.user.id;
      if (isInChannel.value) {
        void $trpc.voice.leaveVoiceChannel.mutate({ roomId });
        if (userId) leaveVoice(roomId, userId);
      }
      for (const id of [...peerConnections.keys()]) cleanupPeer(id);
      cleanupLocalStream();
      signalUnsubscribable?.unsubscribe();
      signalUnsubscribable = undefined;
      isInChannel.value = false;
      isMuted.value = false;
      clearSpeakingUsers();
      participantJoinUnsubscribable.unsubscribe();
      participantLeaveUnsubscribable.unsubscribe();
      muteChangedUnsubscribable.unsubscribe();
    };
  });

  return { isInChannel, isMuted, join, leave, toggleMute };
};
