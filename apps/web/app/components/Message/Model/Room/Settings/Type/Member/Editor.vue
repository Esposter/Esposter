<script setup lang="ts">
import type { RoomInMessage, User } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface Props {
  member: User;
  roomId: RoomInMessage["id"];
}

const { member, roomId } = defineProps<Props>();
const roleStore = useRoleStore();
const { getRoles, readMemberRoles } = roleStore;
const allRoles = computed(() => getRoles(roomId).filter(({ isEveryone }) => !isEveryone));

await readMemberRoles({ roomId, userIds: [member.id] });
</script>

<template>
  <div flex flex-col gap-4>
    <div flex gap-x-3 items-center>
      <StyledAvatar :image="member.image" :name="member.name" />
      <div font-bold text-title-medium>{{ member.name }}</div>
    </div>
    <div v-if="allRoles.length === 0" op-medium-emphasis>No roles available.</div>
    <v-list v-else density="compact" rd>
      <MessageModelRoomRoleMemberListItem v-for="role of allRoles" :key="role.id" :role :room-id :user-id="member.id" />
    </v-list>
  </div>
</template>
