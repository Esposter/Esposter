<script setup lang="ts">
import type { User } from "@prisma/client";

interface MessageListProps {
  members: User[];
  hasMore: boolean;
  fetchMoreMembers: () => Promise<void>;
}

const props = defineProps<MessageListProps>();
const { fetchMoreMembers } = props;
const { members, hasMore } = toRefs(props);
</script>

<template>
  <v-list>
    <ChatModelMemberListItem v-for="member in members" :key="member.id" :member="member" />
    <Waypoint :active="hasMore" @change="fetchMoreMembers" />
  </v-list>
</template>
