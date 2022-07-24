<script setup lang="ts">
import type { User } from "@/server/trpc/user";

interface ChatMemberListItemProps {
  member: User;
}

const { member } = defineProps<ChatMemberListItemProps>();
</script>

<template>
  <v-list-item :title="member.username" @click="">
    <template #prepend>
      <v-badge m="r-4" color="green" location="bottom end" dot>
        <v-list-item-avatar>
          <v-img :src="member.avatar" :alt="member.username" />
        </v-list-item-avatar>
      </v-badge>
    </template>
  </v-list-item>
</template>
