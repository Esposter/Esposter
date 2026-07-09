<script setup lang="ts">
import { RoomPermission } from "@esposter/db-schema";

const modelValue = defineModel<bigint>({ required: true });
const roomPermissions = Object.entries(RoomPermission);
</script>

<template>
  <v-list density="compact" rd>
    <MessageModelRoomSettingsTypePermissionsPermissionListItem
      v-for="[key, permission] of roomPermissions"
      :key
      v-model="modelValue"
      :permission
      :permission-key="key"
    />
  </v-list>
</template>
