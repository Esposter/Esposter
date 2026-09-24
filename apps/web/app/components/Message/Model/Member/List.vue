<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { getMemberGroups } from "@/services/message/member/getMemberGroups";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";

const { readMembers, readMoreMembers } = useReadMembers();
const { isPending } = await readMembers();
const memberStore = useMemberStore();
const { hasMore, memberCount, memberCountsByTopRole, members } = storeToRefs(memberStore);
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
const roleStore = useRoleStore();
const { getMemberRoles } = roleStore;
const memberGroups = computed(() => {
  const room = currentRoom.value;
  if (room) return getMemberGroups(members.value, (userId) => getMemberRoles(room.id, userId));
  else return [];
});
const roleIdMemberCountMap = computed(
  () => new Map(memberCountsByTopRole.value.map((countByTopRole) => [countByTopRole.roleId, countByTopRole.count])),
);
// Derived from the running total so member join/leave subscription updates keep the roleless group current
const rolelessMemberCount = computed(
  () => memberCount.value - memberCountsByTopRole.value.reduce((sum, countByTopRole) => sum + countByTopRole.count, 0),
);
const getMemberCountSuffix = (roleId: string) => {
  const groupMemberCount = roleId ? roleIdMemberCountMap.value.get(roleId) : rolelessMemberCount.value;
  return groupMemberCount === undefined ? "" : ` — ${groupMemberCount}`;
};
</script>

<template>
  <div p-2 flex flex-col gap-2>
    <ul v-if="isPending" aria-busy="true" aria-label="Members" flex flex-col>
      <MessageModelMemberListItemSkeleton v-for="index of DEFAULT_READ_LIMIT" :key="index" />
    </ul>
    <template v-else-if="currentRoom">
      <!-- Discord's member list: one group per top role, headed by its name and how many hold it -->
      <section v-for="{ members: groupMembers, role } of memberGroups" :key="role?.id ?? ''" flex flex-col>
        <h3 text-sm text-muted px-3 py-1 uppercase>
          {{ role?.name ?? "Members" }}{{ getMemberCountSuffix(role?.id ?? "") }}
        </h3>
        <ul flex flex-col>
          <MessageModelMemberListItem v-for="member of groupMembers" :key="member.id" :member :room="currentRoom" />
        </ul>
      </section>
      <StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
        <ul aria-busy="true" aria-label="More members" flex flex-col>
          <MessageModelMemberListItemSkeleton v-for="index of DEFAULT_READ_LIMIT" :key="index" />
        </ul>
      </StyledWaypoint>
    </template>
  </div>
</template>
