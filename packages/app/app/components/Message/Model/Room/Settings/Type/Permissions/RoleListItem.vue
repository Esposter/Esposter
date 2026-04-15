<script setup lang="ts">
import type { Room, RoomRole } from "@esposter/db-schema";

interface RoleListItemProps {
  isActive: boolean;
  role: RoomRole;
  roomId: Room["id"];
}

const { isActive, role, roomId } = defineProps<RoleListItemProps>();
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <v-list-item :active="isActive" @click="emit('click')">
    <template #prepend>
      <div h-3 mr-2 rd-full w-3 :style="{ backgroundColor: role.color ?? 'rgb(var(--v-theme-on-surface-variant))' }" />
    </template>
    <v-list-item-title>{{ role.name }}</v-list-item-title>
    <template v-if="!role.isEveryone" #append>
      <MessageModelRoomSettingsTypePermissionsRoleDeleteButton :role-id="role.id" :room-id />
    </template>
  </v-list-item>
</template>
