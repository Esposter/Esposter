import type { User } from "@esposter/db-schema";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { MemberIndexedDbStoreConfiguration } from "@/services/cache/indexedDb/configurations/MemberIndexedDbStoreConfiguration";
import { readIndexedDb } from "@/services/cache/indexedDb/readIndexedDb";
import { writeIndexedDb } from "@/services/cache/indexedDb/writeIndexedDb";
import { useRoomStore } from "@/store/message/room";
import { useUserStore } from "@/store/message/user";
import { useMemberStore } from "@/store/message/user/member";
import { getResultAsync, noop } from "@esposter/shared";

export const useMemberCache = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { count, members } = storeToRefs(memberStore);
  const { initializeCursorPaginationData } = memberStore;
  const userStore = useUserStore();
  const { storeUsers } = userStore;
  const online = useOnline();
  let pendingOperation: Promise<void> = Promise.resolve();

  watchDeep(members, (newMembers) => {
    const roomId = currentRoomId.value;
    if (!roomId || newMembers.length === 0) return;
    const previousOperation = pendingOperation;
    pendingOperation = getResultAsync(async () => {
      await previousOperation;
      await writeIndexedDb(MemberIndexedDbStoreConfiguration, newMembers, roomId);
    }).match(noop, console.error);
  });

  watch(currentRoomId, (newCurrentRoomId) => {
    if (!newCurrentRoomId || online.value) return;
    const previousOperation = pendingOperation;
    pendingOperation = getResultAsync(async () => {
      await previousOperation;
      const cachedMembers = await readIndexedDb(MemberIndexedDbStoreConfiguration, newCurrentRoomId);
      if (currentRoomId.value !== newCurrentRoomId || cachedMembers.length === 0) return;

      const cachedData = new CursorPaginationData<User>();
      cachedData.items = cachedMembers;
      count.value = cachedMembers.length;
      initializeCursorPaginationData(cachedData);
      storeUsers(cachedMembers);
    }).match(noop, console.error);
  });

  const flush = () => pendingOperation;
  return { flush };
};
