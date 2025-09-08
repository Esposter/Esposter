<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useMemberStore } from "@/store/message/member";

const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
const readMoreMembers = await useReadMembers();
</script>

<template>
  <v-list overflow-y-auto="!">
    <MessageModelMemberListItem v-for="member of members" :key="member.id" :member />
    <StyledWaypoint :active="hasMore" @change="readMoreMembers">
      <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </StyledWaypoint>
  </v-list>
</template>
