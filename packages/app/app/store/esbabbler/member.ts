import type { User } from "#shared/db/schema/users";

import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { useEsbabblerStore } from "@/store/esbabbler";
import { useRoomStore } from "@/store/esbabbler/room";

export const useMemberStore = defineStore("esbabbler/member", () => {
  const esbabblerStore = useEsbabblerStore();
  const roomStore = useRoomStore();
  const { itemList, ...rest } = createCursorPaginationDataMap<string>(() => roomStore.currentRoomId);
  const pushMemberIdList = (...items: string[]) => itemList.value.push(...items);
  const members = computed(() => {
    const members: User[] = [];
    for (const memberId of itemList.value) {
      const user = esbabblerStore.userMap.get(memberId);
      if (!user) continue;
      members.push(user);
    }
    return members.toSorted((a, b) => a.name.localeCompare(b.name));
  });
  return {
    members,
    pushMemberIdList,
    ...rest,
  };
});
