import type { JoinCallOptions } from "#src/models/message/room/call/JoinCallOptions";
import type { CallParticipantRow } from "@esposter/db-schema";

import { knockerTable } from "#src/services/message/room/call/constants";
import { getDefaultJoinCallOptions } from "#src/services/message/room/call/getDefaultJoinCallOptions";
import { getKnockerRemovalEntry } from "#src/services/message/room/call/getKnockerRemovalEntry";
import { createRowsResponse } from "#src/services/shared/overlay/createRowsResponse";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useOverlayStore } from "#src/store/overlay";
import { useConnectionStore } from "#src/store/realtime/connection";

export const useKnockerStore = defineStore("message/room/call/knocker", () => {
  const { $trpc } = useNuxtApp();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeAwaited, writeOptimistic } = overlayStore;
  const connectionStore = useConnectionStore();
  const { openCall } = connectionStore;
  const knockingCallSessionId = ref("");
  const joinCallOptions = ref<JoinCallOptions>(getDefaultJoinCallOptions());
  // The call whose lobby is shown. Its knockers are the overlay's live rows for it, so a lobby left behind by a call the
  // Doorkeeper has left is not shown in the next one
  const lobbyCallSessionId = ref("");
  const lobbyKnockers = view(knockerTable);
  const knockers = computed(() =>
    lobbyKnockers.value.filter(({ callSessionId }) => callSessionId === lobbyCallSessionId.value),
  );
  // The server records the knock before the call's socket opens, so the waiting screen shows once it has. The knock
  // Is awaited, and the pending button that sent it stays pending until then
  const knockCall = (callId: string) =>
    writeAwaited(
      async () => {
        await $trpc.callSession.knocker.knockCall.mutate({ id: callId });
        knockingCallSessionId.value = callId;
        await openCall(callId);
        return [];
      },
      { onError: createErrorAlert },
    );
  const cancelKnock = () => {
    knockingCallSessionId.value = "";
  };
  const createKnocker = (callSessionId: string, knocker: CallParticipantRow) => {
    lobbyCallSessionId.value = callSessionId;
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
    knockingCallSessionId.value = "";
    joinCallOptions.value = getDefaultJoinCallOptions();
    lobbyCallSessionId.value = "";
  };

  return {
    admitKnocker,
    cancelKnock,
    createKnocker,
    dismissKnocker,
    joinCallOptions,
    knockCall,
    knockers,
    knockingCallSessionId,
    resetKnockerState,
  };
});
