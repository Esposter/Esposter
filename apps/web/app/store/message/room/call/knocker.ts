import type { JoinCallOptions } from "#src/models/message/room/call/JoinCallOptions";
import type { CallParticipantRow } from "@esposter/db-schema";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { knockerTable } from "#src/services/message/room/call/constants";
import { getDefaultJoinCallOptions } from "#src/services/message/room/call/getDefaultJoinCallOptions";
import { getKnockerRemovalEntry } from "#src/services/message/room/call/getKnockerRemovalEntry";
import { createRowsResponse } from "#src/services/shared/overlay/createRowsResponse";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useOverlayStore } from "#src/store/overlay";
import { useConnectionStore } from "#src/store/realtime/connection";
import { withFinalizerAsync } from "@esposter/shared";

export const useKnockerStore = defineStore("message/room/call/knocker", () => {
  const { $trpc } = useNuxtApp();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeAwaited, writeOptimistic } = overlayStore;
  const connectionStore = useConnectionStore();
  const { openCall } = connectionStore;
  const knockingCallSessionId = ref("");
  // The calls a knock is out for, until the server answers it. A page that leaves cancels them, so the answer finds no knock
  // To take and shows no waiting screen for it
  const pendingKnockCallSessionIds = ref(new Set<string>());
  const joinCallOptions = ref<JoinCallOptions>(getDefaultJoinCallOptions());
  // The call whose lobby is shown, and the knockers the lobby was told of. The overlay keeps every knocker row it was sent,
  // So a lobby begun again shows only the knockers it was told of since it began, and not those the call let go when its
  // Last participant left while the doorkeeper was away
  const lobbyCallSessionId = ref("");
  const lobbyKnockerIds = ref(new Set<string>());
  const lobbyKnockers = view(knockerTable);
  const knockers = computed(() =>
    lobbyKnockers.value.filter(
      ({ callSessionId, id }) => callSessionId === lobbyCallSessionId.value && lobbyKnockerIds.value.has(id),
    ),
  );
  // The server records the knock before the call's socket opens, so the waiting screen shows once it has. The knock
  // Is awaited, and the pending button that sent it stays pending until then
  const knockCall = (callId: string) => {
    pendingKnockCallSessionIds.value.add(callId);
    return withFinalizerAsync(
      () =>
        writeAwaited(
          async () => {
            await $trpc.callSession.knocker.knockCall.mutate({ id: callId });
            // A knock its page cancelled while the server had it is taken by nothing, so no waiting screen and no socket
            if (!pendingKnockCallSessionIds.value.has(callId)) return [];

            knockingCallSessionId.value = callId;
            await openCall(callId);
            return [];
          },
          { awaitedBecause: AwaitedReason.ServerDecidedOutcome, onError: createErrorAlert },
        ),
      () => {
        pendingKnockCallSessionIds.value.delete(callId);
      },
    );
  };
  // Whether a knock for the call is out or waiting, so the page that holds it can cancel it when it leaves
  const checkIsKnockingCall = (callId: string) =>
    knockingCallSessionId.value === callId || pendingKnockCallSessionIds.value.has(callId);
  const cancelKnock = () => {
    pendingKnockCallSessionIds.value.clear();
    knockingCallSessionId.value = "";
  };
  const createKnocker = (callSessionId: string, knocker: CallParticipantRow) => {
    // A lobby for another call, or one begun again after the doorkeeper left, starts with no knockers told to it
    if (callSessionId !== lobbyCallSessionId.value) lobbyKnockerIds.value = new Set();
    lobbyCallSessionId.value = callSessionId;
    lobbyKnockerIds.value.add(knocker.id);
    arrive(knockerTable, { ...knocker, callSessionId });
  };
  // A let-in and a dismissal differ only in the call they send. The server answers the knocker's row, or no row when it
  // Holds no knocker to remove, which leaves the knocker in the lobby where it stood
  const removeKnocker = (
    callSessionId: string,
    knockerId: string,
    sendRemoval: () => Promise<CallParticipantRow | null>,
  ) => {
    writeOptimistic(
      async () => {
        const knocker = await sendRemoval();
        return createRowsResponse(knockerTable, knocker ? [{ ...knocker, callSessionId }] : []);
      },
      { entry: getKnockerRemovalEntry(knockerId, new Date()), onError: createErrorAlert },
    );
  };
  // Admitting is the server's decision, so the knocker leaves the lobby as the server's tombstone for it confirms
  const admitKnocker = (callSessionId: string, knockerId: string) => {
    removeKnocker(callSessionId, knockerId, () =>
      $trpc.callSession.knocker.admitKnocker.mutate({ callSessionId, knockerId }),
    );
  };
  const dismissKnocker = (callSessionId: string, knockerId: string) => {
    removeKnocker(callSessionId, knockerId, () =>
      $trpc.callSession.knocker.dismissKnocker.mutate({ callSessionId, knockerId }),
    );
  };
  const resetKnockerState = () => {
    pendingKnockCallSessionIds.value.clear();
    knockingCallSessionId.value = "";
    joinCallOptions.value = getDefaultJoinCallOptions();
    lobbyCallSessionId.value = "";
  };

  return {
    admitKnocker,
    cancelKnock,
    checkIsKnockingCall,
    createKnocker,
    dismissKnocker,
    joinCallOptions,
    knockCall,
    knockers,
    knockingCallSessionId,
    resetKnockerState,
  };
});
