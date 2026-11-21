import type { ExecuteAdminActionInput } from "#shared/models/db/moderation/ExecuteAdminActionInput";

import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { MutationStatus } from "#src/models/shared/MutationStatus";
import { useRoomStore } from "#src/store/message/room/index";

// The room an action names is the one on screen unless the caller names another, such as the room a call is held in
export const useExecuteAdminAction = (getRoomId?: () => string | undefined) => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const roomStore = useRoomStore();
  const { currentRoom } = storeToRefs(roomStore);
  const getActionRoomId = getRoomId ?? (() => currentRoom.value?.id);
  // Moderation state applies via the subscription echo, and the server decides what an action does, so nothing is drawn
  // First. Whether it was kept is handed back, so the dialog that asked stays open over a refusal
  return async (getInput: (roomId: string) => ExecuteAdminActionInput) => {
    const roomId = getActionRoomId();
    if (!roomId) return false;

    const outcome = await executeMutation(() => $trpc.message.moderation.executeAdminAction.mutate(getInput(roomId)), {
      // Each admin action is an independent moderation call with no natural entity key
      awaitedBecause: AwaitedReason.ServerDecidedOutcome,
      key: Symbol("executeAdminAction"),
    });
    return outcome.status === MutationStatus.Succeeded;
  };
};
