import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { ForwardDraft } from "#src/models/message/ForwardDraft";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { applyIfUnchanged } from "#src/services/shared/applyIfUnchanged";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useRoomStore } from "#src/store/message/room/index";
import { useOverlayStore } from "#src/store/overlay";

export const useForwardStore = defineStore("message/input/forward", () => {
  const roomStore = useRoomStore();
  const { $trpc } = useNuxtApp();
  const overlayStore = useOverlayStore();
  const { writeAwaited } = overlayStore;
  // The rooms whose forward is out, which the panel reads as its pending state. An awaited write has no entry to show
  // It
  const forwardingRoomIds = ref(new Set<string>());
  const isForwardPending = computed(() => forwardingRoomIds.value.size > 0);
  const { data: forwardMessageId, getDataRef: getForwardMessageIdRef } = useDataMap<0 | ClientMessage["id"]>(
    () => roomStore.currentRoomId,
    0,
  );
  const { data: roomIds, getDataRef: getRoomIdsRef } = useDataMap<string[]>(() => roomStore.currentRoomId, []);
  const { data: messageInput, getDataRef: getMessageInputRef } = useDataMap(() => roomStore.currentRoomId, "");
  // Empties the panel of the room the forward was composed in, once the server has answered the send. The room is named
  // By The caller, since the route may have moved on by the time the answer lands. Each field empties only while it
  // Still Holds what the forward sent, so a text or room pick the reader changed while the server had it stays in the
  // Panel
  const clearForward = (roomId: string, sent: ForwardDraft) => {
    getForwardMessageIdRef(roomId).value = 0;
    applyIfUnchanged(getMessageInputRef(roomId), sent.message, "");
    applyIfUnchanged(getRoomIdsRef(roomId), sent.roomIds, []);
  };
  // The forward is one write per panel, and a Send pressed while the one before it is out is dropped, whichever dialog
  // Shows the panel, so a reopened dialog cannot send the forward a second time. Resolves to whether the server kept it
  const sendForward = async (roomId: string, forward: ClientMessage, sent: ForwardDraft) => {
    if (forwardingRoomIds.value.has(roomId)) return false;

    forwardingRoomIds.value.add(roomId);
    const isSent = await writeAwaited(
      async () => {
        await $trpc.message.forwardMessage.mutate({
          id: forward.id,
          message: sent.message,
          roomId: forward.roomId,
          roomIds: sent.roomIds,
        });
        clearForward(roomId, sent);
        return [];
      },
      { awaitedBecause: AwaitedReason.ServerDecidedOutcome, onError: createErrorAlert },
    );
    forwardingRoomIds.value.delete(roomId);
    return isSent;
  };
  return { clearForward, forwardMessageId, isForwardPending, messageInput, roomIds, sendForward };
});
