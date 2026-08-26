import type { User } from "@esposter/db-schema";

import { requirePartitionKey } from "@/services/message/requirePartitionKey";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useUserStore } from "@/store/message/user";
import { useMemberStore } from "@/store/message/user/member";

export const useReadMembers = () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { scopedRoomId } = storeToRefs(roomStore);
  const memberStore = useMemberStore();
  const { getBoundMemberCounts, readItems, readMoreItems } = memberStore;
  const userStore = useUserStore();
  const { storeUsers } = userStore;
  const readUserStatuses = useReadUserStatuses();
  const roleStore = useRoleStore();
  const { readMemberRoles } = roleStore;
  const readNicknames = useReadNicknames();
  // The term the rows on screen came from, so paging carries it with the cursor — a member who joins mid-scroll
  // Cannot appear in a later page of a search they do not match
  const searchedName = ref("");
  const readMetadata = (roomId: string, memberIds: User["id"][]) => {
    if (memberIds.length === 0) return Promise.resolve();
    return Promise.all([
      readUserStatuses(memberIds),
      readMemberRoles({ roomId, userIds: memberIds }),
      readNicknames(roomId, memberIds),
    ]);
  };
  // A member row is not a user row: the list renders a status, roles and a nickname beside every name. Every path
  // That produces a page — the first, a search, a scroll — goes through here rather than restating the fan-out,
  // Which is how one of them comes to render rows the others do not
  const readMemberPage = async (roomId: string, cursor: string, signal?: AbortSignal) => {
    const cursorPaginationData = await $trpc.room.readMembers.query(
      { cursor, filter: searchedName.value ? { name: searchedName.value } : undefined, roomId },
      { signal },
    );
    await readMetadata(
      roomId,
      cursorPaginationData.items.map(({ id }) => id),
    );
    storeUsers(cursorPaginationData.items);
    return cursorPaginationData;
  };
  // The room's own totals, which a search must never re-read: the roleless group is derived from a count of
  // Everybody, and counting a filtered room would describe one nobody is in
  const readMemberCounts = async () => {
    const roomId = requirePartitionKey(scopedRoomId.value, readMemberCounts.name);
    // Bound before the first await for the same reason readItems binds the member list itself: a room switch made
    // While these are in flight must not file this room's totals under the one being entered
    const boundMemberCounts = getBoundMemberCounts();
    const [newCount, newCountsByTopRole] = await Promise.all([
      $trpc.room.countMembers.query({ roomId }),
      $trpc.room.countMembersByTopRole.query({ roomId }),
    ]);
    boundMemberCounts.value.count = newCount;
    boundMemberCounts.value.countsByTopRole = newCountsByTopRole;
  };
  const searchMembers = (name: string, signal?: AbortSignal) => {
    const roomId = requirePartitionKey(scopedRoomId.value, searchMembers.name);
    searchedName.value = name;
    return readItems(() => readMemberPage(roomId, "", signal));
  };
  const readMembers = () => {
    const roomId = requirePartitionKey(scopedRoomId.value, readMembers.name);
    searchedName.value = "";
    return readItems(async () => {
      const [, cursorPaginationData] = await Promise.all([readMemberCounts(), readMemberPage(roomId, "")]);
      return cursorPaginationData;
    });
  };
  const readMoreMembers = (onComplete: () => void) => {
    const roomId = requirePartitionKey(scopedRoomId.value, readMoreMembers.name);
    return readMoreItems((cursor) => readMemberPage(roomId, cursor), onComplete);
  };
  return { readMemberCounts, readMembers, readMoreMembers, searchMembers };
};
