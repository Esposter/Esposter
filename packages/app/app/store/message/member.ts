import type { User } from "@esposter/db";

import { EN_US_COMPARATOR } from "@/services/shared/constants";
import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";

export const useMemberStore = defineStore("message/member", () => {
  const roomStore = useRoomStore();
  const { items, ...rest } = useCursorPaginationDataMap<User>(() => roomStore.currentRoomId);
  const memberIds = computed(() => items.value.map(({ id }) => id));
  const members = computed(() => {
    const members: User[] = [];
    for (const memberId of memberIds.value) {
      const member = roomStore.memberMap.get(memberId);
      if (!member) continue;
      members.push(member);
    }
    return members.toSorted((a, b) => EN_US_COMPARATOR.compare(a.name, b.name));
  });
  return {
    members,
    ...createOperationData(members, ["id"], "Member"),
    ...rest,
  };
});
