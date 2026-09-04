import type { User } from "@esposter/db-schema";

import { EN_US_COMPARATOR } from "#shared/services/intl/constants";
import { MemberCounts } from "@/models/message/user/MemberCounts";
import { topRoleChangeHooks } from "@/services/message/member/topRoleChangeHooks";
import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useUserStore } from "@/store/message/user";
import { DerivedDatabaseEntityType } from "@esposter/db-schema";

export const useMemberStore = defineStore("message/user/member", () => {
  const roomStore = useRoomStore();
  const roleStore = useRoleStore();
  const { mutateMemberRoles } = roleStore;
  const userStore = useUserStore();
  const { storeUser } = userStore;
  const userToRoomStore = useUserToRoomStore();
  const { getDisplayName } = userToRoomStore;
  // Keyed by room, like messages. A single global list would still hold the previous room's members after a
  // Switch, which is unreadable state for anything asking "are these rows this room's" — the offline cache asks
  // Exactly that before it hydrates or persists, and cannot answer it from a list that outlives the partition
  const { getSlice, items, ...restData } = useCursorPaginationDataMap<User>(() => roomStore.scopedRoomId);
  const members = computed(() =>
    items.value.toSorted((firstMember, secondMember) => EN_US_COMPARATOR.compare(firstMember.name, secondMember.name)),
  );
  // Single source of truth for resolving a member id to its room display name (nickname over global name),
  // Falling back to the raw id for actors/targets no longer in the loaded member list.
  const getMemberName = (userId: User["id"]): string => {
    const member = members.value.find(({ id }) => id === userId);
    return member ? getDisplayName(member, roomStore.scopedRoomId) : userId;
  };
  // Server-computed totals for the member list headers — the paginated items only hold loaded pages. Keyed by
  // Room for the same reason the list is: they describe one room, only the network can produce them, and a
  // Switch made offline would otherwise leave the room being entered wearing the totals of the one just left
  // The read that fetches them binds this slice before its first await, the way it already binds the member
  // List — `memberCounts` itself tracks whichever room is current, which is what the rendered headers want and
  // Exactly what a response arriving after a room switch must not use
  const {
    data: memberCounts,
    getBoundData: getBoundMemberCounts,
    getDataRef: getMemberCountsRef,
  } = useDataMap(
    () => roomStore.scopedRoomId,
    () => new MemberCounts(),
  );
  // Reading views, like `members` above: every write names its room — the read binds one up front, the join and
  // Leave handlers take the event's room, and an offline hydrate takes the partition it was read for
  const memberCount = computed(() => memberCounts.value.count);
  const memberCountsByTopRole = computed(() => memberCounts.value.countsByTopRole);
  // The room the change happened in, which is not necessarily the room on screen: a role assigned from a profile
  // Card in one room while another is open belongs to that room's totals. The roleless group derives from the
  // Total, so a change with no room is written to a slice nothing reads and is thereby a no-op
  topRoleChangeHooks.register((roomId, previousTopRoleId, newTopRoleId) => {
    const roomCountsByTopRole = getMemberCountsRef(roomId).value.countsByTopRole;
    for (const [roleId, delta] of [
      [previousTopRoleId, -1],
      [newTopRoleId, 1],
    ] as const) {
      if (!roleId) continue;
      const countByTopRole = roomCountsByTopRole.find((existingCount) => existingCount.roleId === roleId);
      if (countByTopRole) countByTopRole.count += delta;
      else if (delta > 0) roomCountsByTopRole.push({ count: delta, roleId });
    }
  });
  // A join or a leave is subscribed for every room the user is in, so both handlers are told which room the
  // Event happened in — and that is the room its list and its running total are written to, whichever room is on
  // Screen. `members` and `memberCount` above are the reading views and neither can be written through: `members` is
  // Sorted, so a write through it would land on the copy `toSorted` produced rather than the room's own rows
  const getRoomOperationData = (roomId: string) =>
    createOperationData(getSlice(roomId).items, ["id"], DerivedDatabaseEntityType.Member);
  const storeCreateMember = (roomId: string, member: User) => {
    storeUser(member);
    getRoomOperationData(roomId).createMember(member);
    getMemberCountsRef(roomId).value.count++;
  };
  const storeDeleteMember = (roomId: string, id: User["id"]) => {
    // A member who leaves is a member whose top role became "none", so the departure goes through the one
    // Funnel that owns the per-role totals rather than decrementing them a second time here — otherwise the
    // Total drops while the role group keeps the leaver, and the roleless remainder absorbs the whole error
    // (in a room where every member holds a role it goes negative).
    mutateMemberRoles(roomId, id, []);
    getRoomOperationData(roomId).deleteMember({ id });
    getMemberCountsRef(roomId).value.count--;
  };
  return {
    getBoundMemberCounts,
    getMemberCountsRef,
    getMemberName,
    getSlice,
    memberCount,
    memberCountsByTopRole,
    members,
    ...restData,
    storeCreateMember,
    storeDeleteMember,
  };
});
