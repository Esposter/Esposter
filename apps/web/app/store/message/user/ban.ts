import type { DeleteBanInput } from "#shared/models/db/moderation/DeleteBanInput";
import type { BanInRoom } from "#shared/models/db/room/BanInRoom";
import type { RoomInMessage } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";
import { ID_SEPARATOR } from "@esposter/shared";

export const useBanStore = defineStore("message/user/ban", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { executeMutation } = useMutation();
  // Keyed by room, like the member and invite lists: the Bans panel reads one room's bans, and a rejected unban puts
  // Its ban back under the room it lifted it from, whichever room has been loaded since
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<BanInRoom>(() => roomStore.scopedRoomId);
  const getRoomOperationData = (roomId: RoomInMessage["id"]) =>
    createOperationData(getSlice(roomId).items, ["roomId", "userId"], DatabaseEntityType.Ban);

  const deleteBan = async (input: DeleteBanInput) => {
    const { items: roomItems } = getSlice(input.roomId);
    const { createBan: storeCreateBan, deleteBan: storeDeleteBan } = getRoomOperationData(input.roomId);
    await executeMutation(() => $trpc.message.moderation.deleteBan.mutate(input), {
      // The one row this write lifts — unbans are keyed per ban and never queue against each other
      applyOptimistic: () => {
        const deletedBan = roomItems.value.find(({ userId }) => userId === input.userId);
        storeDeleteBan(input);
        return () => {
          if (deletedBan) storeCreateBan(deletedBan);
        };
      },
      key: `${input.roomId}${ID_SEPARATOR}${input.userId}`,
    });
  };

  return { deleteBan, getSlice, items, ...restData };
});
