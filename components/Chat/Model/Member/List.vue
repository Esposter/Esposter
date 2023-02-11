<script setup lang="ts">
import type { User } from "@prisma/client";

interface MessageListProps {
  members: User[];
}

const props = defineProps<MessageListProps>();
const { members } = $(toRefs(props));
</script>

<template>
  <v-list overflow-y="auto!">
    <ChatModelMemberListItem v-for="member in members" :key="member.id" :member="member" />
  </v-list>
</template>
