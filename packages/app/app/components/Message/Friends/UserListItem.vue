<script setup lang="ts">
import type { User } from "better-auth";

interface MessageFriendsUserListItemProps {
  image?: User["image"];
  name: User["name"];
}

const { image, name } = defineProps<MessageFriendsUserListItemProps>();
</script>

<template>
  <v-list-item :title="name">
    <template #prepend>
      <StyledAvatar mr-3 :image :name :avatar-props="{ size: 36 }" />
    </template>
    <template #append>
      <slot name="append" />
    </template>
  </v-list-item>
</template>
