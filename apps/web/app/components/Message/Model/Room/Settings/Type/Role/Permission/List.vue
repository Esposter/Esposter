<script setup lang="ts">
import { RoomPermissionCategoryItems } from "@/services/message/room/role/RoomPermissionCategoryItems";

const modelValue = defineModel<bigint>({ required: true });
</script>

<template>
  <div flex flex-col gap-6>
    <section v-for="{ category, permissions } of RoomPermissionCategoryItems" :key="category" flex flex-col>
      <h4 ui-heading>{{ category }}</h4>
      <MessageModelRoomSettingsTypeRolePermissionListItem
        v-for="{ description, permission, title } of permissions"
        :key="title"
        v-model="modelValue"
        :description
        :permission
        :title
      />
    </section>
  </div>
</template>
