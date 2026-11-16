import type { DeleteBanInput } from "#shared/models/db/moderation/DeleteBanInput";
import type { BanInRoom } from "#shared/models/db/room/BanInRoom";
import type { RoomInMessage } from "@esposter/db-schema";

import { createOperationData } from "#src/services/shared/createOperationData";
import { getInsertedItems } from "#src/services/shared/getInsertedItems";
import { useRoomStore } from "#src/store/message/room/index";
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

  const deleteBan = (input: DeleteBanInput) => {
    const { items: roomItems } = getSlice(input.roomId);
    const { deleteBan: storeDeleteBan } = getRoomOperationData(input.roomId);
    executeMutation(() => $trpc.message.moderation.deleteBan.mutate(input), {
      // The one row this write lifts — unbans are keyed per ban and never queue against each other
      applyOptimistic: () => {
        const deletedBan = roomItems.value.find(({ userId }) => userId === input.userId);
        storeDeleteBan(input);
        return () => {
          if (!deletedBan || roomItems.value.some(({ userId }) => userId === deletedBan.userId)) return;

          // The bans are paged newest first, by the time each is made and then by the banned user, so the ban goes back to
          // The place that order gives it rather than to the end of the list
          const deletedBanTime = deletedBan.createdAt.getTime();
          roomItems.value = getInsertedItems(
            roomItems.value,
            deletedBan,
            ({ createdAt, userId }) =>
              createdAt.getTime() < deletedBanTime ||
              (createdAt.getTime() === deletedBanTime && userId < deletedBan.userId),
          );
        };
      },
      key: `${input.roomId}${ID_SEPARATOR}${input.userId}`,
    });
  };

  return { deleteBan, getSlice, items, ...restData };
});
