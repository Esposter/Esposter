<script setup lang="ts">
import type { User } from "@prisma/client";

interface MemberListItemProps {
  member: User;
}

const { member } = defineProps<MemberListItemProps>();
</script>

<template>
  <v-list-item :title="member.username" @click="">
    <template #prepend>
      <v-badge m="r-4" color="green" location="bottom end" dot>
        <v-avatar v-if="member.avatar">
          <v-img :src="member.avatar" :alt="member.username" />
        </v-avatar>
        <DefaultAvatar v-else />
      </v-badge>
    </template>
  </v-list-item>
</template>
