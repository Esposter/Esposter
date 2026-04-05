import type { VoiceSignalPayload } from "#shared/models/room/voice/VoiceSignalPayload";
import type { Unsubscribable } from "@trpc/server/observable";

import { VoiceSignalType } from "#shared/models/room/voice/VoiceSignalType";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { authClient } from "@/services/auth/authClient";
import { ICE_SERVERS, LOCAL_PARTICIPANT_ID, SPEAKING_THRESHOLD } from "@/services/message/voice/constants";
import { useRoomStore } from "@/store/message/room";
import { useVoiceStore } from "@/store/message/voice";
import { exhaustiveGuard, getIsServer, jsonDateParse } from "@esposter/shared";

export const useVoiceChannel = () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const voiceStore = useVoiceStore();
  const { clearSpeakers, createSpeaker, deleteSpeaker, joinVoice, leaveVoice, setMute, setParticipants } = voiceStore;
  const { speakingIds } = storeToRefs(voiceStore);
  const isInChannel = ref(false);
  const isMuted = ref(false);

  let localStream: MediaStream | null = null;
  const peerConnections = new Map<string, RTCPeerConnection>();
  const remoteAudioElements = new Map<string, HTMLAudioElement>();
  const speakingCleanups = new Map<string, () => Promise<void>>();
  const candidateQueues = new Map<string, RTCIceCandidateInit[]>();
  let signalUnsubscribable: undefined | Unsubscribable;

  const cleanupPeer = async (id: string) => {
    peerConnections.get(id)?.close();
    peerConnections.delete(id);
    remoteAudioElements.get(id)?.remove();
    remoteAudioElements.delete(id);
    await speakingCleanups.get(id)?.();
    speakingCleanups.delete(id);
    candidateQueues.delete(id);
    deleteSpeaker(id);
  };

  const cleanupLocalStream = async () => {
    const stream = localStream;
    const cleanup = speakingCleanups.get(LOCAL_PARTICIPANT_ID);
    localStream = null;
    speakingCleanups.delete(LOCAL_PARTICIPANT_ID);
    if (stream) for (const track of stream.getTracks()) track.stop();
    await cleanup?.();
  };

  const setupSpeakingDetection = (id: string, stream: MediaStream) => {
    if (getIsServer()) return;
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
      const isCurrentlySpeaking = speakingIds.value.includes(id);

      if (isSpeaking && !isCurrentlySpeaking) createSpeaker(id);
      else if (!isSpeaking && isCurrentlySpeaking) deleteSpeaker(id);

      animationFrame = requestAnimationFrame(detectSpeaking);
    };

    animationFrame = requestAnimationFrame(detectSpeaking);
    speakingCleanups.set(id, async () => {
      cancelAnimationFrame(animationFrame);
      await audioContext.close();
    });
  };

  const buildPeerConnection = (roomId: string, remoteId: string) => {
    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnections.set(remoteId, peerConnection);

    if (localStream) for (const track of localStream.getTracks()) peerConnection.addTrack(track, localStream);

    peerConnection.ontrack = getSynchronizedFunction(async ({ streams }) => {
      const remoteStream = streams[0];
      if (!remoteStream) return;
      setupSpeakingDetection(remoteId, remoteStream);
      const audio = new Audio();
      audio.srcObject = remoteStream;
      await audio.play();
      remoteAudioElements.set(remoteId, audio);
    });

    peerConnection.onicecandidate = getSynchronizedFunction(async ({ candidate }) => {
      if (!candidate) return;
      await $trpc.voice.sendSignal.mutate({
        payload: { data: JSON.stringify(candidate.toJSON()), targetId: remoteId, type: VoiceSignalType.Candidate },
        roomId,
      });
    });

    return peerConnection;
  };

  const createPeerConnection = async (roomId: string, remoteId: string) => {
    if (getIsServer()) return;

    const peerConnection = buildPeerConnection(roomId, remoteId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    await $trpc.voice.sendSignal.mutate({
      payload: { data: JSON.stringify(offer), targetId: remoteId, type: VoiceSignalType.Offer },
      roomId,
    });
  };

  const flushIceCandidates = async (id: string) => {
    const peerConnection = peerConnections.get(id);
    const queue = candidateQueues.get(id);
    if (!peerConnection || !queue) return;
    for (const candidate of queue) await peerConnection.addIceCandidate(candidate);

    candidateQueues.delete(id);
  };

  const getSignalHandler =
    (roomId: string) =>
    async ({ payload: { data, type }, senderId }: { payload: VoiceSignalPayload; senderId: string }) => {
      try {
        switch (type) {
          case VoiceSignalType.Answer: {
            const peerConnection = peerConnections.get(senderId);
            if (!peerConnection) return;
            await peerConnection.setRemoteDescription(jsonDateParse<RTCSessionDescriptionInit>(data));
            await flushIceCandidates(senderId);
            break;
          }
          case VoiceSignalType.Candidate: {
            const peerConnection = peerConnections.get(senderId);
            const candidateData = jsonDateParse<RTCIceCandidateInit>(data);
            if (!peerConnection?.remoteDescription) {
              const queue = candidateQueues.get(senderId) ?? [];
              queue.push(candidateData);
              candidateQueues.set(senderId, queue);
              return;
            }
            await peerConnection.addIceCandidate(candidateData);
            break;
          }
          case VoiceSignalType.Offer: {
            const peerConnection = buildPeerConnection(roomId, senderId);
            await peerConnection.setRemoteDescription(jsonDateParse<RTCSessionDescriptionInit>(data));
            await flushIceCandidates(senderId);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            await $trpc.voice.sendSignal.mutate({
              payload: { data: JSON.stringify(answer), targetId: senderId, type: VoiceSignalType.Answer },
              roomId,
            });
            break;
          }
          default:
            exhaustiveGuard(type);
        }
      } catch {
        // Drop malformed signal payloads to prevent unhandled rejections from aborting the subscription
      }
    };

  const join = async () => {
    if (getIsServer() || !currentRoomId.value || isInChannel.value) return;

    const roomId = currentRoomId.value;
    isInChannel.value = true;

    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      // Subscribe to signals before joining so we don't miss offers from existing participants
      signalUnsubscribable = $trpc.voice.onSignal.subscribe(roomId, {
        onData: getSynchronizedFunction(getSignalHandler(roomId)),
      });

      const participants = await $trpc.voice.joinVoiceChannel.mutate({ roomId });
      setParticipants(roomId, participants);
      setupSpeakingDetection(LOCAL_PARTICIPANT_ID, localStream);
    } catch {
      await leave();
    }
  };

  const leave = async () => {
    if (!currentRoomId.value || !isInChannel.value) return;

    const roomId = currentRoomId.value;
    const sessionId = session.value.data?.session.id;
    isInChannel.value = false;
    isMuted.value = false;

    try {
      if (sessionId) leaveVoice(roomId, sessionId);
      await $trpc.voice.leaveVoiceChannel.mutate({ roomId });
    } finally {
      await Promise.all(peerConnections.keys().map((id) => cleanupPeer(id)));
      await cleanupLocalStream();
      signalUnsubscribable?.unsubscribe();
      signalUnsubscribable = undefined;
      clearSpeakers();
    }
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
      onData: getSynchronizedFunction(async (participant) => {
        joinVoice(roomId, participant);
        if (isInChannel.value) await createPeerConnection(roomId, participant.id);
      }),
    });
    const participantLeaveUnsubscribable = $trpc.voice.onParticipantLeave.subscribe(roomId, {
      onData: getSynchronizedFunction(async (id) => {
        leaveVoice(roomId, id);
        await cleanupPeer(id);
      }),
    });
    const muteChangedUnsubscribable = $trpc.voice.onMuteChanged.subscribe(roomId, {
      onData: (muteChange) => {
        setMute(roomId, muteChange.id, muteChange.isMuted);
      },
    });

    return async () => {
      const sessionId = session.value.data?.session.id;
      if (isInChannel.value) {
        await $trpc.voice.leaveVoiceChannel.mutate({ roomId });
        if (sessionId) leaveVoice(roomId, sessionId);
      }
      await Promise.all(peerConnections.keys().map((id) => cleanupPeer(id)));
      await cleanupLocalStream();
      signalUnsubscribable?.unsubscribe();
      signalUnsubscribable = undefined;
      isInChannel.value = false;
      isMuted.value = false;
      clearSpeakers();
      participantJoinUnsubscribable.unsubscribe();
      participantLeaveUnsubscribable.unsubscribe();
      muteChangedUnsubscribable.unsubscribe();
    };
  });

  return { isInChannel, isMuted, join, leave, toggleMute };
};
