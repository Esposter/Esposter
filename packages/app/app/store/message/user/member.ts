import type { MemberCountByTopRole } from "#shared/models/db/room/MemberCountByTopRole";
import type { User } from "@esposter/db-schema";

import { EN_US_COMPARATOR } from "#shared/services/intl/constants";
import { topRoleChangeHooks } from "@/services/message/member/topRoleChangeHooks";
import { createOperationData } from "@/services/shared/createOperationData";
import { useRoomStore } from "@/store/message/room";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { useUserStore } from "@/store/message/user";

export const useMemberStore = defineStore("message/user/member", () => {
  const roomStore = useRoomStore();
  const userStore = useUserStore();
  const { storeUser, storeUsers } = userStore;
  const userToRoomStore = useUserToRoomStore();
  const { getDisplayName } = userToRoomStore;
  const { items, ...restData } = useCursorPaginationData<User>();
  const members = computed(() => items.value.toSorted((a, b) => EN_US_COMPARATOR.compare(a.name, b.name)));
  // Single source of truth for resolving a member id to its room display name (nickname over global name),
  // Falling back to the raw id for actors/targets no longer in the loaded member list.
  const getMemberName = (userId: User["id"]): string => {
    const member = members.value.find(({ id }) => id === userId);
    return member ? getDisplayName(member, roomStore.currentRoomId) : userId;
  };
  const count = ref(0);
  // Server-computed group totals for the member list headers — the paginated items only hold loaded pages
  const countsByTopRole = ref<MemberCountByTopRole[]>([]);
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
