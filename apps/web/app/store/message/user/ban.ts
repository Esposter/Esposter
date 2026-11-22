import type { DeleteBanInput } from "#shared/models/db/moderation/DeleteBanInput";
import type { BanInRoom } from "#shared/models/db/room/BanInRoom";
import type { BanKey } from "#src/models/message/user/BanKey";
import type { Page } from "@esposter/db-schema";

import { banTable } from "#src/services/message/user/ban/constants";
import { getDeleteBanEntry } from "#src/services/message/user/ban/getDeleteBanEntry";
import { collectRowVersions } from "#src/services/realtime/collectRowVersions";
import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { createHeaderConfirmations } from "#src/services/shared/overlay/createHeaderConfirmations";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useRoomStore } from "#src/store/message/room/index";
import { useOverlayStore } from "#src/store/overlay";

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
        const { rowVersions } = await collectRowVersions(() => $trpc.message.moderation.deleteBan.mutate(input));
        // The header names the ban row it removed at the version it left it, so the entry is confirmed by its own write. The
        // List's own read brings the tombstone to the rows it holds
        return { arrivals: [], confirmed: createHeaderConfirmations([banTable], rowVersions) };
      },
      { entry: getDeleteBanEntry(input.roomId, input.userId, new Date()), onError: createErrorAlert },
    );
  };

  return { deleteBan, getBanItems, getSliceOperationData, items, readBanPage };
});
