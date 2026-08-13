<script setup lang="ts">
import { RoomPermissionListItems } from "@/services/message/room/role/RoomPermissionListItems";

const modelValue = defineModel<bigint>({ required: true });
</script>

<template>
  <v-list density="compact" rd>
    <MessageModelRoomSettingsTypeRolePermissionListItem
      v-for="{ permission, title } of RoomPermissionListItems"
      :key="title"
      v-model="modelValue"
      :permission
      :title
    />
  </v-list>
</template>
