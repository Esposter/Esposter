import type { ExecuteAdminActionInput } from "#shared/models/db/moderation/ExecuteAdminActionInput";

import { useRoomStore } from "@/store/message/room";

export const useExecuteAdminAction = () => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();
  const roomStore = useRoomStore();
  const { currentRoom } = storeToRefs(roomStore);
  // Moderation state applies via the subscription echo — non-optimistic
  return async (getInput: (roomId: string) => ExecuteAdminActionInput, onComplete: () => void) => {
    const roomId = currentRoom.value?.id;
    if (roomId) await executeMutation(() => $trpc.message.moderation.executeAdminAction.mutate(getInput(roomId)));
    onComplete();
  };
};
