import type { User } from "#shared/db/schema/users";

import { EN_US_COMPARATOR } from "@/services/shared/constants";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { useEsbabblerStore } from "@/store/esbabbler";
import { useRoomStore } from "@/store/esbabbler/room";

export const useMemberStore = defineStore("esbabbler/member", () => {
  const esbabblerStore = useEsbabblerStore();
  const roomStore = useRoomStore();
  const { items, ...rest } = createCursorPaginationDataMap<string>(() => roomStore.currentRoomId);
  const pushMemberIds = (...newItems: string[]) => items.value.push(...newItems);
  const members = computed(() => {
    const members: User[] = [];
    for (const memberId of items.value) {
      const user = esbabblerStore.userMap.get(memberId);
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
