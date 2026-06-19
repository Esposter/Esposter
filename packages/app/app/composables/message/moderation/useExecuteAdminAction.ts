import type { ExecuteAdminActionInput } from "#shared/models/db/moderation/ExecuteAdminActionInput";

import { useRoomStore } from "@/store/message/room";
import { withFinalizerAsync } from "@esposter/shared";

export const useExecuteAdminAction = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { currentRoom } = storeToRefs(roomStore);
  return (getInput: (roomId: string) => ExecuteAdminActionInput, onComplete: () => void) =>
    withFinalizerAsync(async () => {
      if (!currentRoom.value) return;
      await $trpc.message.moderation.executeAdminAction.mutate(getInput(currentRoom.value.id));
    }, onComplete);
};
