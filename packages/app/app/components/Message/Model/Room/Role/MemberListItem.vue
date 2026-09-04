<script setup lang="ts">
import type { RoomInMessage, RoomRoleInMessage, User } from "@esposter/db-schema";

interface Props {
  role: RoomRoleInMessage;
  roomId: RoomInMessage["id"];
  userId: User["id"];
}

const { role, roomId, userId } = defineProps<Props>();
const { hasRole, isManageable, toggleRole } = useToggleMemberRole(
  () => roomId,
  () => userId,
  () => role,
);
</script>

<template>
  <v-list-item :title="role.name">
    <template #prepend>
      <MessageModelRoomSettingsTypeRoleColorDot mr-2 :color="role.color" />
    </template>
    <template #append>
      <v-switch :disabled="!isManageable" :model-value="hasRole" density="compact" @update:model-value="toggleRole" />
    </template>
  </v-list-item>
</template>
