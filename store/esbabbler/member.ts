import type { User } from "@/db/schema/users";
import { DerivedDatabaseEntityType } from "@/models/shared/entity/DerivedDatabaseEntityType";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { useRoomStore } from "@/store/esbabbler/room";

export const useMemberStore = defineStore("esbabbler/member", () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const { itemList, ...rest } = createCursorPaginationDataMap<User>(currentRoomId);
  return {
    ...createOperationData(itemList, DerivedDatabaseEntityType.Member),
    ...rest,
  };
});
