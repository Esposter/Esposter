<script setup lang="ts">
import type { RoomInMessage, User } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
    <div flex gap-3 items-center>
      <UiAvatar :image="member.image" :name="member.name" />
      <h3 truncate ui-heading>{{ member.name }}</h3>
    </div>
    <UiEmptyState v-if="allRoles.length === 0" :meaning="UiIconMeaning.Lock" title="No roles available." />
    <div v-else flex flex-col>
      <MessageModelRoomRoleMemberListItem v-for="role of allRoles" :key="role.id" :role :room-id :user-id="member.id" />
    </div>
  </div>
</template>
