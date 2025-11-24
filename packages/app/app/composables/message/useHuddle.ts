import type { User } from "@esposter/db-schema";
import type { MediaConnection } from "peerjs";

import { authClient } from "@/services/auth/authClient";
import { useAlertStore } from "@/store/alert";
import { useRoomStore } from "@/store/message/room";
import { Peer } from "peerjs";

export const useHuddle = () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const peer = shallowRef<Peer>();
  const stream = shallowRef<MediaStream>();
  const calls = ref<Map<string, MediaConnection>>(new Map());
  const peers = ref<Map<string, { stream: MediaStream; user: User }>>(new Map());
  const peerList = computed(() => [...peers.value.values()]);
  const isHuddleActive = ref(false);
  const huddleParticipants = ref<User[]>([]);

  const callPeer = (peerId: string, user: User) => {
    if (!peer.value || !stream.value) return;

    const call = peer.value.call(peerId, stream.value);
    calls.value.set(peerId, call);
    call.on("stream", (stream) => {
      peers.value.set(peerId, { stream, user });
    });
    call.on("close", () => {
      calls.value.delete(peerId);
      peers.value.delete(peerId);
    });
  };

  const joinHuddle = async () => {
    if (!currentRoomId.value || !session.value.data?.user.id) return;

    try {
      stream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      if (error instanceof DOMException) createAlert(error.message, "error");
    }

    peer.value = new Peer(session.value.data.user.id);
    peer.value.on("open", async () => {
      if (!currentRoomId.value) return;

      await $trpc.huddle.joinHuddle.mutate({ roomId: currentRoomId.value });
      isHuddleActive.value = true;

      const participants = await $trpc.huddle.readHuddleParticipants.query({ roomId: currentRoomId.value });
      for (const { user } of participants) callPeer(user.id, user);
    });
    peer.value.on("call", async (call) => {
      if (!stream.value || !currentRoomId.value) return;

      call.answer(stream.value);
      calls.value.set(call.peer, call);
      const [user] = await $trpc.room.readMembersByIds.query({
        ids: [call.peer],
        roomId: currentRoomId.value,
      });
      call.on("stream", (stream) => {
        peers.value.set(call.peer, { stream, user });
      });
      call.on("close", () => {
        calls.value.delete(call.peer);
        peers.value.delete(call.peer);
      });
    });
    peer.value.on("error", ({ message }) => {
      createAlert(message, "error");
    });
  };

  const leaveHuddle = async () => {
    if (!currentRoomId.value) return;

    await $trpc.huddle.leaveHuddle.mutate({ roomId: currentRoomId.value });
    for (const track of stream.value?.getTracks() ?? []) track.stop();
    stream.value = undefined;
    for (const call of calls.value.values()) call.close();
    calls.value.clear();
    peers.value.clear();
    peer.value?.destroy();
    peer.value = undefined;
    isHuddleActive.value = false;
  };

  const fetchParticipants = async () => {
    if (!currentRoomId.value) return;
    const participants = await $trpc.huddle.readHuddleParticipants.query({ roomId: currentRoomId.value });
    huddleParticipants.value = participants.map(({ user }) => user);
  };

  watchImmediate(currentRoomId, fetchParticipants);
  watchImmediate(currentRoomId, (roomId) => {
    if (!roomId) return;

    const joinSubscription = $trpc.huddle.onJoinHuddle.subscribe(
      { roomId },
      {
        onData: async (input) => {
          if (!currentRoomId.value || !isHuddleActive.value || !session.value.data?.user.id) return;

          await fetchParticipants();
          const [user] = await $trpc.room.readMembersByIds.query({
            ids: [input.userId],
            roomId: currentRoomId.value,
          });
          callPeer(input.userId, user);
        },
      },
    );
    const leaveSubscription = $trpc.huddle.onLeaveHuddle.subscribe(
      { roomId },
      {
        onData: async (input) => {
          await fetchParticipants();
          const call = calls.value.get(input.userId);
          if (call) {
            call.close();
            calls.value.delete(input.userId);
          }
          peers.value.delete(input.userId);
        },
      },
    );

    return () => {
      joinSubscription.unsubscribe();
      leaveSubscription.unsubscribe();
    };
  });

  return {
    fetchParticipants,
    huddleParticipants,
    isHuddleActive,
    joinHuddle,
    leaveHuddle,
    peerList,
    stream,
  };
};
