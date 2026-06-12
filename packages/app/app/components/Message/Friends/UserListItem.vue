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
      <v-avatar size="36" mr-3>
        <v-img v-if="image" :src="image" />
        <span v-else>{{ name[0] }}</span>
      </v-avatar>
    </template>
    <template #append>
      <slot name="append" />
    </template>
  </v-list-item>
</template>
