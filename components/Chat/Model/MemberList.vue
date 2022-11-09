<script setup lang="ts">
import type { User } from "@prisma/client";
import VWaypoint from "@/components/VWaypoint.vue";

interface MessageListProps {
  members: User[];
  hasMore: boolean;
  fetchMoreMembers: InstanceType<typeof VWaypoint>["$props"]["onChange"];
}

const props = defineProps<MessageListProps>();
const { members, hasMore, fetchMoreMembers } = $(toRefs(props));
</script>

<template>
  <v-list overflow-y="auto!">
    <ChatModelMemberListItem v-for="member in members" :key="member.id" :member="member" />
    <VWaypoint :active="hasMore" @change="fetchMoreMembers" />
  </v-list>
</template>
