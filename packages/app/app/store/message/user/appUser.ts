import type { AppUser } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useAppUserStore = defineStore("message/user/appUser", () => {
  const roomStore = useRoomStore();
  const { items, ...rest } = useCursorPaginationDataMap<AppUser>(() => roomStore.currentRoomId);
  return {
    items,
    ...createOperationData(items, ["id"], DatabaseEntityType.AppUser),
    ...rest,
  };
});
