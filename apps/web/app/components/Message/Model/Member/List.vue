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
  if (!room) return [];
  return getMemberGroups(members.value, (userId) => getMemberRoles(room.id, userId));
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
  <v-list>
    <template v-if="isPending">
      <StyledSkeletonListItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-else-if="currentRoom">
      <template v-for="{ members: groupMembers, role } of memberGroups" :key="role?.id ?? ''">
        <v-list-subheader font-bold uppercase text-body-small>
          {{ role?.name ?? "Members" }}{{ getMemberCountSuffix(role?.id ?? "") }}
        </v-list-subheader>
        <MessageModelMemberListItem v-for="member of groupMembers" :key="member.id" :member :room="currentRoom" />
      </template>
      <StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
        <StyledSkeletonListItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
