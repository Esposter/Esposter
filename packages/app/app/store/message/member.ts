import type { User } from "#shared/db/schema/users";

import { EN_US_COMPARATOR } from "@/services/shared/constants";
import { createOperationData } from "@/services/shared/createOperationData";
import { useMessageStore } from "@/store/message";
import { useRoomStore } from "@/store/message/room";

export const useMemberStore = defineStore("message/member", () => {
  const messageStore = useMessageStore();
  const roomStore = useRoomStore();
  const { items, ...rest } = useCursorPaginationDataMap<User>(() => roomStore.currentRoomId);
  const memberIds = computed(() => items.value.map(({ id }) => id));
  const members = computed(() => {
    const members: User[] = [];
    for (const memberId of memberIds.value) {
      const user = messageStore.userMap.get(memberId);
      if (!user) continue;
      members.push(user);
    }
    return members.toSorted((a, b) => EN_US_COMPARATOR.compare(a.name, b.name));
  });
  return {
    members,
    ...createOperationData(members, ["id"], "Member"),
    ...rest,
  };
});
