<script setup lang="ts">
import { useMemberStore } from "@/store/esbabbler/member";

const memberStore = useMemberStore();
const { hasMore, memberList } = storeToRefs(memberStore);
const readMoreMembers = await useReadMembers();
</script>

<template>
  <EsbabblerModelMemberList :members="memberList" :has-more="hasMore" :read-more-members="readMoreMembers" />
</template>
