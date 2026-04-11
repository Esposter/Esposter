import type { VoiceSignalPayload } from "#shared/models/room/voice/VoiceSignalPayload";
import type { Unsubscribable } from "@trpc/server/observable";

import { VoiceSignalType } from "#shared/models/room/voice/VoiceSignalType";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { ICE_SERVERS, LOCAL_PARTICIPANT_ID, SPEAKING_THRESHOLD } from "@/services/message/voice/constants";
import { useVoiceStore } from "@/store/message/room/voice";
import { exhaustiveGuard, jsonDateParse } from "@esposter/shared";
// Module-level WebRTC state — only one voice call at a time.
let localStream: MediaStream | null = null;
let isRemoteAudioMuted = false;
const peerConnections = new Map<string, RTCPeerConnection>();
const remoteAudioElements = new Map<string, HTMLAudioElement>();
const speakingCleanups = new Map<string, () => Promise<void>>();
const candidateQueues = new Map<string, RTCIceCandidateInit[]>();
let signalUnsubscribable: undefined | Unsubscribable;

export const useWebRtcStore = defineStore("message/room/webRtc", () => {
  const { $trpc } = useNuxtApp();
  const isProduction = useIsProduction();

  const cleanupPeer = async (id: string) => {
    peerConnections.get(id)?.close();
    peerConnections.delete(id);
    remoteAudioElements.get(id)?.remove();
    remoteAudioElements.delete(id);
    await speakingCleanups.get(id)?.();
    speakingCleanups.delete(id);
    candidateQueues.delete(id);
  };

  const cleanupLocalStream = async () => {
    const stream = localStream;
    const cleanup = speakingCleanups.get(LOCAL_PARTICIPANT_ID);
    localStream = null;
    speakingCleanups.delete(LOCAL_PARTICIPANT_ID);
    if (stream) for (const track of stream.getTracks()) track.stop();
    await cleanup?.();
  };

  const setupSpeakingDetection = async (peerId: string, speakerId: string, stream: MediaStream) => {
    await speakingCleanups.get(peerId)?.();
    const audioContext = new window.AudioContext();
    await audioContext.resume();
    const analyser = audioContext.createAnalyser();
    audioContext.createMediaStreamSource(stream).connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrame = 0;
    const voiceStore = useVoiceStore();
    const { createSpeaker, deleteSpeaker } = voiceStore;

    const detectSpeaking = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      const isSpeaking = average > SPEAKING_THRESHOLD;
      const isCurrentlySpeaking = voiceStore.speakingIds.includes(speakerId);

      if (isSpeaking && !isCurrentlySpeaking) createSpeaker(speakerId);
      else if (!isSpeaking && isCurrentlySpeaking) deleteSpeaker(speakerId);

      animationFrame = window.requestAnimationFrame(detectSpeaking);
    };

    animationFrame = window.requestAnimationFrame(detectSpeaking);
    speakingCleanups.set(peerId, async () => {
      window.cancelAnimationFrame(animationFrame);
      await audioContext.close();
    });
  };

  const buildPeerConnection = (roomId: string, remoteId: string) => {
    const peerConnection = new window.RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnections.set(remoteId, peerConnection);

    if (localStream) for (const track of localStream.getTracks()) peerConnection.addTrack(track, localStream);

    peerConnection.ontrack = getSynchronizedFunction(async ({ streams }) => {
      const remoteStream = streams[0];
      if (!remoteStream) return;
      await setupSpeakingDetection(remoteId, remoteId, remoteStream);
      const audio = new window.Audio();
      audio.srcObject = remoteStream;
      audio.muted = isRemoteAudioMuted;
      remoteAudioElements.set(remoteId, audio);
      try {
        await audio.play();
      } catch (error: unknown) {
        if (!isProduction) console.warn("[WebRTC] audio.play() rejected (autoplay policy?):", error);
      }
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

  const createPeerConnectionOffer = async (roomId: string, remoteId: string) => {
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
      } catch (error) {
        // Drop malformed signal payloads to prevent unhandled rejections from aborting the subscription
        if (!isProduction) console.warn("[WebRTC] Dropped malformed signal:", error);
      }
    };

  const acquireLocalStream = async () => {
    if (localStream) return localStream;
    localStream = await window.navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    return localStream;
  };

  const setLocalStreamMuted = (isMuted: boolean) => {
    if (!localStream) return;
    for (const track of localStream.getAudioTracks()) track.enabled = !isMuted;
  };

  const setRemoteAudioMuted = (isDeafened: boolean) => {
    isRemoteAudioMuted = isDeafened;
    for (const audio of remoteAudioElements.values()) audio.muted = isDeafened;
  };

  const subscribeToSignals = (roomId: string) => {
    unsubscribeFromSignals();
    signalUnsubscribable = $trpc.voice.onSignal.subscribe(roomId, {
      onData: getSynchronizedFunction(getSignalHandler(roomId)),
    });
  };

  const unsubscribeFromSignals = () => {
    signalUnsubscribable?.unsubscribe();
    signalUnsubscribable = undefined;
  };

  const cleanupAll = async () => {
    unsubscribeFromSignals();
    await Promise.all([...peerConnections.keys()].map((id) => cleanupPeer(id)));
    await cleanupLocalStream();
    candidateQueues.clear();
  };

  return {
    acquireLocalStream,
    cleanupAll,
    cleanupPeer,
    createPeerConnectionOffer,
    setLocalStreamMuted,
    setRemoteAudioMuted,
    setupSpeakingDetection,
    subscribeToSignals,
  };
});
