import type { User } from "#shared/db/schema/users";

import { DerivedDatabaseEntityType } from "#shared/models/entity/DerivedDatabaseEntityType";
import { createOperationData } from "@/services/shared/createOperationData";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { useRoomStore } from "@/store/esbabbler/room";

export const useMemberStore = defineStore("esbabbler/member", () => {
  const roomStore = useRoomStore();
  const { itemList, ...rest } = createCursorPaginationDataMap<User>(() => roomStore.currentRoomId);
  const { memberList, ...restOperationData } = createOperationData(itemList, ["id"], DerivedDatabaseEntityType.Member);
  const members = computed(() => memberList.value.toSorted((a, b) => a.name.localeCompare(b.name)));
  return {
    members,
    ...restOperationData,
    ...rest,
  };
});
