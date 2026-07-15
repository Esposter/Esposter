<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { getMemberGroups } from "@/services/message/member/getMemberGroups";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";

const { readMembers, readMoreMembers } = useReadMembers();
const { isPending } = await readMembers();
const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
const roleStore = useRoleStore();
const { getMemberRoles } = roleStore;
const memberGroups = computed(() => {
  const room = currentRoom.value;
  if (!room) return [];
  return getMemberGroups(members.value, (userId) => getMemberRoles(room.id, userId));
});
</script>

<template>
  <v-list>
    <template v-if="isPending">
      <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-else-if="currentRoom">
      <template v-for="{ members: groupMembers, role } of memberGroups" :key="role?.id ?? ''">
        <v-list-subheader font-bold uppercase text-body-small>
          {{ role?.name ?? "Members" }} — {{ groupMembers.length }}
        </v-list-subheader>
        <MessageModelMemberListItem v-for="member of groupMembers" :key="member.id" :member :room="currentRoom" />
      </template>
      <StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
        <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
