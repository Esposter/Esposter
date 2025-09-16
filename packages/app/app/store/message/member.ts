import type { User } from "#shared/db/schema/users";

import { EN_US_COMPARATOR } from "@/services/shared/constants";
import { useMessageStore } from "@/store/message";
import { useRoomStore } from "@/store/message/room";

export const useMemberStore = defineStore("message/member", () => {
  const messageStore = useMessageStore();
  const roomStore = useRoomStore();
  const { items, ...rest } = useCursorPaginationDataMap<string>(() => roomStore.currentRoomId);
  const pushMemberIds = (...newItems: string[]) => items.value.push(...newItems);
  const members = computed(() => {
    const members: User[] = [];
    for (const memberId of items.value) {
      const user = messageStore.userMap.get(memberId);
      if (!user) continue;
      members.push(user);
    }
    return members.toSorted((a, b) => EN_US_COMPARATOR.compare(a.name, b.name));
  });
  return {
    members,
    pushMemberIds,
    ...rest,
  };
});
