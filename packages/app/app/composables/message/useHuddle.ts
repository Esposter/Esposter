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
  const isInHuddle = ref(false);
  const huddleUsers = ref<User[]>([]);

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
      isInHuddle.value = true;
      for (const huddleUser of huddleUsers.value) addPeer(huddleUser);
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
    isInHuddle.value = false;
  };

  const addPeer = (user: User) => {
    if (!peer.value || !stream.value) return;

    const call = peer.value.call(user.id, stream.value);
    calls.value.set(user.id, call);
    call.on("stream", (stream) => {
      peers.value.set(user.id, { stream, user });
    });
    call.on("close", () => {
      calls.value.delete(user.id);
      peers.value.delete(user.id);
    });
  };

  const removePeer = (userId: string) => {
    const call = calls.value.get(userId);
    if (call) call.close();
  };

  return {
    addPeer,
    huddleUsers,
    isInHuddle,
    joinHuddle,
    leaveHuddle,
    peerList,
    removePeer,
    stream,
  };
};
