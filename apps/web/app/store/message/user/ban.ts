import type { DeleteBanInput } from "#shared/models/db/moderation/DeleteBanInput";
import type { BanInRoom } from "#shared/models/db/room/BanInRoom";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Page } from "@esposter/db-schema";

import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { createConfirmation } from "#src/services/shared/overlay/createConfirmation";
import { createTable } from "#src/services/shared/overlay/createTable";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useRoomStore } from "#src/store/message/room/index";
import { useOverlayStore } from "#src/store/overlay";
import { bansInMessage } from "@esposter/db-schema";

// A row carries its banned user's name in the room, which is the name the panel shows, so the table holds the whole read row
const banTable: Table<BanInRoom, typeof bansInMessage> = createTable(bansInMessage);

// A list names each of its rows by the room and the user it bans, and the rows themselves are the overlay's
type BanKey = Pick<BanInRoom, "roomId" | "userId">;

// The ban as its unban leaves it: removed at once, as the tombstone the server's answer confirms
const getDeleteBanEntry = (roomId: BanKey["roomId"], userId: BanKey["userId"], deletedAt: Date): Entry =>
  getHeldRowEntry(banTable, [roomId, userId], (ban) => ({ ...ban, deletedAt }));

export const useBanStore = defineStore("message/user/ban", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const overlayStore = useOverlayStore();
  const { arrive, view, writeOptimistic } = overlayStore;
  const bans = view(banTable);
  // Keyed by room, like the member and invite lists: the Bans panel reads one room's bans, and an unban that is answered
  // Or refused lands on the room it lifted the ban from, whichever room has been loaded since
  const { getSliceOperationData, items: listedBanKeys } = useCursorPaginationDataMap<BanKey>(
    () => roomStore.scopedRoomId,
  );
  // The live rows the keys name, in the keys' order. The view leaves a removed ban's tombstone out
  const toLiveBans = (keys: readonly BanKey[]) =>
    keys.flatMap(({ roomId, userId }) => {
      const ban = bans.value.find(
        (row): row is BanInRoom => row.roomId === roomId && row.userId === userId && checkIsVersioned(row),
      );
      return ban ? [ban] : [];
    });
  // A page of a room's bans arrives row by row, and the list keeps the keys the page named, in the order the server gave them
  const readBanPage = ({ items: pageBans, ...page }: Page<BanInRoom>): Page<BanKey> => {
    for (const ban of pageBans) arrive(banTable, ban);
    return { ...page, items: pageBans.map(({ roomId, userId }) => ({ roomId, userId })) };
  };
  const getBanItems = (roomId: BanKey["roomId"]) =>
    computed(() => toLiveBans(getSliceOperationData(roomId).items.value));
  const items = computed(() => toLiveBans(listedBanKeys.value));
  const deleteBan = (input: DeleteBanInput) => {
    writeOptimistic(
      async () => {
        const removedBan = await $trpc.message.moderation.deleteBan.mutate(input);
        // The answer is the ban row without its user, which the list keeps, so it confirms the entry at its version and
        // The list's own read brings the tombstone to the rows it holds
        return {
          arrivals: [],
          confirmed: [createConfirmation(banTable, [input.roomId, input.userId], removedBan.version)],
        };
      },
      { entry: getDeleteBanEntry(input.roomId, input.userId, new Date()), onError: createErrorAlert },
    );
  };

  return { deleteBan, getBanItems, getSliceOperationData, items, readBanPage };
});
