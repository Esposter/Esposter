import type { User } from "@esposter/db-schema";

import { EN_US_COMPARATOR } from "#shared/services/intl/constants";
import { MemberCounts } from "@/models/message/user/MemberCounts";
import { topRoleChangeHooks } from "@/services/message/member/topRoleChangeHooks";
import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useUserStore } from "@/store/message/user";

export const useMemberStore = defineStore("message/user/member", () => {
  const roomStore = useRoomStore();
  const roleStore = useRoleStore();
  const { mutateMemberRoles } = roleStore;
  const userStore = useUserStore();
  const { storeUser, storeUsers } = userStore;
  const userToRoomStore = useUserToRoomStore();
  const { getDisplayName } = userToRoomStore;
  // Keyed by room, like messages. A single global list would still hold the previous room's members after a
  // Switch, which is unreadable state for anything asking "are these rows this room's" — the offline cache asks
  // Exactly that before it hydrates or persists, and cannot answer it from a list that outlives the partition
  const { items, ...restData } = useCursorPaginationDataMap<User>(() => roomStore.currentRoomId);
  const members = computed(() => items.value.toSorted((a, b) => EN_US_COMPARATOR.compare(a.name, b.name)));
  // Single source of truth for resolving a member id to its room display name (nickname over global name),
  // Falling back to the raw id for actors/targets no longer in the loaded member list.
  const getMemberName = (userId: User["id"]): string => {
    const member = members.value.find(({ id }) => id === userId);
    return member ? getDisplayName(member, roomStore.currentRoomId) : userId;
  };
  // Server-computed totals for the member list headers — the paginated items only hold loaded pages. Keyed by
  // Room for the same reason the list is: they describe one room, only the network can produce them, and a
  // Switch made offline would otherwise leave the room being entered wearing the totals of the one just left
  const { data: memberCounts } = useDataMap(
    () => roomStore.currentRoomId,
    () => new MemberCounts(),
  );
  const count = computed({
    get: () => memberCounts.value.count,
    set: (newCount) => {
      memberCounts.value.count = newCount;
    },
  });
  const countsByTopRole = computed({
    get: () => memberCounts.value.countsByTopRole,
    set: (newCountsByTopRole) => {
      memberCounts.value.countsByTopRole = newCountsByTopRole;
    },
  });
  topRoleChangeHooks.register((roomId, previousTopRoleId, newTopRoleId) => {
    // Counts track the currently open room; the roleless group derives from the total, so "" is a no-op
    if (roomId !== roomStore.currentRoomId) return;
    for (const [roleId, delta] of [
      [previousTopRoleId, -1],
      [newTopRoleId, 1],
    ] as const) {
      if (!roleId) continue;
      const countByTopRole = countsByTopRole.value.find((existingCount) => existingCount.roleId === roleId);
      if (countByTopRole) countByTopRole.count += delta;
      else if (delta > 0) countsByTopRole.value.push({ count: delta, roleId });
    }
  });
  const {
    createMember: baseStoreCreateMember,
    deleteMember: baseStoreDeleteMember,
    ...restOperationData
  } = createOperationData(
    computed({
      get: () => members.value,
      set: (newMembers) => {
        items.value = newMembers;
        storeUsers(newMembers);
      },
    }),
    ["id"],
    "Member",
  );
  const storeCreateMember = (member: User) => {
    baseStoreCreateMember(member);
    storeUser(member);
    count.value++;
  };
  const storeDeleteMember = (id: User["id"]) => {
    // A member who leaves is a member whose top role became "none", so the departure goes through the one
    // Funnel that owns the per-role totals rather than decrementing them a second time here — otherwise the
    // Total drops while the role group keeps the leaver, and the roleless remainder absorbs the whole error
    // (in a room where every member holds a role it goes negative).
    mutateMemberRoles(roomStore.currentRoomId, id, []);
    baseStoreDeleteMember({ id });
    count.value--;
  };
  return {
    count,
    countsByTopRole,
    getMemberName,
    members,
    ...restData,
    storeCreateMember,
    storeDeleteMember,
    ...restOperationData,
  };
});
