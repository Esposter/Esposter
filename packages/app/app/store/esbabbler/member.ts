import type { User } from "#shared/db/schema/users";

import { DerivedDatabaseEntityType } from "#shared/models/entity/DerivedDatabaseEntityType";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { useRoomStore } from "@/store/esbabbler/room";

export const useMemberStore = defineStore("esbabbler/member", () => {
  const roomStore = useRoomStore();
  const { itemList, ...rest } = createCursorPaginationDataMap<User>(() => roomStore.currentRoomId);
  return {
    ...createOperationData(itemList, DerivedDatabaseEntityType.Member),
    ...rest,
  };
});
