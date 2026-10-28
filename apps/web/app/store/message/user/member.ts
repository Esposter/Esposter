import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { PublicUser } from "@esposter/db-schema";

import { EN_US_COMPARATOR } from "#shared/services/intl/constants";
import { MemberCounts } from "@/models/message/user/MemberCounts";
import { memberRoleChangeHooks } from "@/services/message/member/memberRoleChangeHooks";
import { createBatchedRefresh } from "@/services/shared/createBatchedRefresh";
import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useUserStore } from "@/store/message/user";
import { DerivedDatabaseEntityType } from "@esposter/db-schema";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const useMemberStore = defineStore("message/user/member", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const roleStore = useRoleStore();
  const { mutateMemberRoles } = roleStore;
  const userStore = useUserStore();
  const { storeRoomMembers, storeUser, storeUsers } = userStore;
  // Keyed by room, like messages. A single global list would still hold the previous room's members after a
  // Switch, which is unreadable state for anything asking "are these rows this room's" — the offline cache asks
  // Exactly that before it hydrates or persists, and cannot answer it from a list that outlives the partition
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<MemberInRoom>(() => roomStore.scopedRoomId);
  // Sorted the way the server pages them, on the same display name and id, so a loaded page reads in the order the
  // Cursor advances through it
  const members = computed(() =>
    items.value.toSorted(
      (firstMember, secondMember) =>
        EN_US_COMPARATOR.compare(firstMember.displayName, secondMember.displayName) ||
        EN_US_COMPARATOR.compare(firstMember.id, secondMember.id),
    ),
  );
  // Server-computed totals for the member list headers — the paginated items only hold loaded pages. Keyed by
  // Room for the same reason the list is: they describe one room, only the network can produce them, and a
  // Switch made offline would otherwise leave the room being entered wearing the totals of the one just left
  const { data: memberCounts, getDataRef: getMemberCountsRef } = useDataMap(
    () => roomStore.scopedRoomId,
    () => new MemberCounts(),
  );
  // Reading views, like `members` above: every write names its room — the refresh takes the room it was read for
  const memberCount = computed(() => memberCounts.value.memberCount);
  const memberCountsByTopRole = computed(() => memberCounts.value.countsByTopRole);
  // The totals are never adjusted by a delta: a delta applied on top of a read that already counted the change counts
  // It twice, and a delta applied to a group the store never saw the member in is wrong for good. Every change marks its
  // Room, and the batched refresh re-reads the marked rooms one run at a time, so no two reads of a room overlap
  const refreshMemberCounts = createBatchedRefresh(async (roomIds: string[]) => {
    await Promise.all(
      roomIds.map(async (roomId) => {
        const [count, countsByTopRole] = await Promise.all([
          $trpc.room.readMembersCount.query({ roomId }),
          $trpc.room.readMemberCountsByTopRole.query({ roomId }),
        ]);
        const roomMemberCounts = getMemberCountsRef(roomId).value;
        roomMemberCounts.memberCount = count;
        roomMemberCounts.countsByTopRole = countsByTopRole;
      }),
    );
  });
  const refreshMemberCountsInBackground = getSynchronizedFunction((roomId: string) =>
    getResultAsync(() => refreshMemberCounts([roomId])).match(noop, console.error),
  );
  // Every role-membership write re-reads its room's totals, so a leave, a role change, and a committed optimistic write
  // Reach them through the same path. The room is the one the write happened in, not necessarily the one open
  // On Screen — a role assigned from a profile card in one room while another is open belongs to that room's totals
  memberRoleChangeHooks.register(refreshMemberCountsInBackground);
  // A join or a leave is subscribed for every room the user is in, so both handlers are told which room the event
  // Happened in — and that is the room its list is written to, whichever room is on screen. `members` and `memberCount`
  // Above are the reading views and neither can be written through: `members` is sorted, so a write through it would
  // Land on the copy `toSorted` produced rather than the room's own rows
  const getRoomOperationData = (roomId: string) =>
    createOperationData(getSlice(roomId).items, ["id"], DerivedDatabaseEntityType.Member);
  const storeCreateMember = (roomId: string, member: MemberInRoom) => {
    storeUser(member);
    getRoomOperationData(roomId).createMember(member);
    refreshMemberCountsInBackground(roomId);
  };
  const storeDeleteMember = (roomId: string, id: PublicUser["id"]) => {
    // A member who leaves is a member whose top role became "none", so the departure goes through the one funnel that
    // Owns the role groups, which re-reads the room's totals. The row is removed here as the list's own write
    mutateMemberRoles(roomId, id, []);
    getRoomOperationData(roomId).deleteMember({ id });
  };
  // A row the server read back after a change to its display name. The room's list and its names take the server's
  // Resolved name together, so the two cannot disagree about who a member is shown as
  const storeUpdateMembers = (roomId: string, readMembers: MemberInRoom[]) => {
    storeUsers(readMembers);
    storeRoomMembers(roomId, readMembers);
    for (const member of readMembers) getRoomOperationData(roomId).updateMember(member);
  };
  return {
    getMemberCountsRef,
    getSlice,
    memberCount,
    memberCountsByTopRole,
    members,
    refreshMemberCounts,
    ...restData,
    storeCreateMember,
    storeDeleteMember,
    storeUpdateMembers,
  };
});
