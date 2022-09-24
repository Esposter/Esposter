<script setup lang="ts">
import type { User } from "@prisma/client";
import Waypoint from "@/components/Waypoint.vue";

interface MessageListProps {
  members: User[];
  hasMore: boolean;
  fetchMoreMembers: InstanceType<typeof Waypoint>["$props"]["onChange"];
}

const props = defineProps<MessageListProps>();
const { members, hasMore, fetchMoreMembers } = toRefs(props);
</script>

<template>
  <v-list overflow-y="auto!">
    <ChatModelMemberListItem v-for="member in members" :key="member.id" :member="member" />
    <Waypoint :active="hasMore" @change="fetchMoreMembers" />
  </v-list>
</template>
