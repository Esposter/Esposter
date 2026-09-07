<script setup lang="ts">
import { RoomPermissionCategoryItems } from "@/services/message/room/role/RoomPermissionCategoryItems";

const modelValue = defineModel<bigint>({ required: true });
</script>

<template>
  <v-list density="compact" rd>
    <template v-for="{ category, permissions } of RoomPermissionCategoryItems" :key="category">
      <v-list-subheader>{{ category }}</v-list-subheader>
      <MessageModelRoomSettingsTypeRolePermissionListItem
        v-for="{ description, permission, title } of permissions"
        :key="title"
        v-model="modelValue"
        :description
        :permission
        :title
      />
    </template>
  </v-list>
</template>
