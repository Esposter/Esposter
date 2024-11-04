<script setup lang="ts">
import type { User } from "@/server/db/schema/users";

import StyledWaypoint from "@/components/Styled/Waypoint.vue";

interface MemberListProps {
  hasMore: boolean;
  members: User[];
  readMoreMembers: NonNullable<InstanceType<typeof StyledWaypoint>["$props"]["onChange"]>;
}

const { hasMore, members, readMoreMembers } = defineProps<MemberListProps>();
</script>

<template>
  <v-list overflow-y-auto="!">
    <EsbabblerModelMemberListItem v-for="member of members" :key="member.id" :member />
    <StyledWaypoint :active="hasMore" @change="readMoreMembers" />
  </v-list>
</template>
