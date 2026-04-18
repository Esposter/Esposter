<script setup lang="ts">
import type { Room, RoomRole } from "@esposter/db-schema";

import { useRoleStore } from "@/store/message/room/role";

interface RoleListItemProps {
  role: RoomRole;
  roomId: Room["id"];
}

const { role, roomId } = defineProps<RoleListItemProps>();
const roleStore = useRoleStore();
const { selectRole } = roleStore;
const { selectedRoleId } = storeToRefs(roleStore);
</script>

<template>
  <v-list-item :active="role.id === selectedRoleId" @click="selectRole(role.id)">
    <template #prepend>
      <div mr-2 rd-full size-3 :style="{ backgroundColor: role.color ?? 'rgb(var(--v-theme-on-surface-variant))' }" />
    </template>
    <v-list-item-title>{{ role.name }}</v-list-item-title>
    <template v-if="!role.isEveryone" #append>
      <MessageModelRoomSettingsTypePermissionsRoleDeleteButton :role-id="role.id" :room-id />
    </template>
  </v-list-item>
</template>
