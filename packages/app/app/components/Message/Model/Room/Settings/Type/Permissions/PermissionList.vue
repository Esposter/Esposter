<script setup lang="ts">
import { RoomPermission } from "@esposter/db-schema";

const modelValue = defineModel<bigint>({ required: true });
</script>

<template>
  <v-list density="compact" rounded>
    <MessageModelRoomSettingsTypePermissionsPermissionListItem
      v-for="[key, permission] of Object.entries(RoomPermission)"
      :key
      v-model="modelValue"
      :permission
      :permission-key="key"
    />
  </v-list>
</template>
