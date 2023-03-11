<script setup lang="ts">
import type { User } from "@prisma/client";

interface MemberListProps {
  members: User[];
}

const props = defineProps<MemberListProps>();
const { members } = toRefs(props);
</script>

<template>
  <v-list overflow-y="auto!">
    <EsbabblerModelMemberListItem v-for="member in members" :key="member.id" :member="member" />
  </v-list>
</template>
