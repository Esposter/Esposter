<script setup lang="ts">
import type { User } from "better-auth";

interface UserListItemProps {
  image?: User["image"];
  name: User["name"];
}

defineSlots<{ append?: () => VNode }>();
const { image, name } = defineProps<UserListItemProps>();
</script>

<template>
  <v-list-item :title="name">
    <template #prepend>
      <StyledAvatar mr-3 :image :name :avatar-props="{ size: '2.25rem' }" />
    </template>
    <template #append>
      <slot name="append" />
    </template>
  </v-list-item>
</template>
