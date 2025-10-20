import type { User } from "@esposter/db-schema";

import { EN_US_COMPARATOR } from "@/services/shared/constants";
import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";

export const useMemberStore = defineStore("message/user/member", () => {
  const roomStore = useRoomStore();
  const { items, ...rest } = useCursorPaginationDataMap<User>(() => roomStore.currentRoomId);
  const members = computed(() => items.value.toSorted((a, b) => EN_US_COMPARATOR.compare(a.name, b.name)));
  return {
    members,
    ...createOperationData(items, ["id"], "Member"),
    ...rest,
  };
});
