<script setup lang="ts">
import type { User } from "@prisma/client";

interface MemberListProps {
  members: User[];
}

const { members } = defineProps<MemberListProps>();
</script>

<template>
  <v-list overflow-y="auto!">
    <EsbabblerModelMemberListItem v-for="member in members" :key="member.id" :member="member" />
  </v-list>
</template>
