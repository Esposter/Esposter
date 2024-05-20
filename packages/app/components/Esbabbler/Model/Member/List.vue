<script setup lang="ts">
import StyledWaypoint from "@/components/Styled/Waypoint.vue";
import type { User } from "@/db/schema/users";

interface MemberListProps {
  members: User[];
  hasMore: boolean;
  readMoreMembers: NonNullable<InstanceType<typeof StyledWaypoint>["$props"]["onChange"]>;
}

const { members, hasMore, readMoreMembers } = defineProps<MemberListProps>();
</script>

<template>
  <v-list overflow-y-auto="!">
    <EsbabblerModelMemberListItem v-for="member in members" :key="member.id" :member="member" />
    <StyledWaypoint :active="hasMore" @change="readMoreMembers" />
  </v-list>
</template>
