<script setup lang="ts">
import { useMemberStore } from "@/store/esbabbler/member";

const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
const readMoreMembers = await useReadMembers();
</script>

<template>
  <v-list overflow-y-auto="!">
    <EsbabblerModelMemberListItem v-for="member of members" :key="member.id" :member />
    <StyledWaypoint :active="hasMore" @change="readMoreMembers" />
  </v-list>
</template>
