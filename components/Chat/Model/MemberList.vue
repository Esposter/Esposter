<script setup lang="ts">
import Waypoint from "@/components/Waypoint.vue";
import type { User } from "@prisma/client";

interface MessageListProps {
  members: User[];
  hasMore: boolean;
  fetchMoreMembers: InstanceType<typeof Waypoint>["$props"]["onChange"];
}

const props = defineProps<MessageListProps>();
const { fetchMoreMembers } = props;
const { members, hasMore } = toRefs(props);
</script>

<template>
  <v-list overflow-y="auto!">
    <ChatModelMemberListItem v-for="member in members" :key="member.id" :member="member" />
    <Waypoint :active="hasMore" @change="fetchMoreMembers" />
  </v-list>
</template>
