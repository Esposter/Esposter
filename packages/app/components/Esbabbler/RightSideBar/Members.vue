<script setup lang="ts">
import { useMemberStore } from "@/store/esbabbler/member";

const memberStore = useMemberStore();
const { hasMore, memberList } = storeToRefs(memberStore);
const readMoreMembers = await useReadMembers();
</script>

<template>
  <EsbabblerModelMemberList :members="memberList" :has-more :read-more-members />
</template>
