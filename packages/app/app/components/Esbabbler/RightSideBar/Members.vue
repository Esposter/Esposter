<script setup lang="ts">
import { useMemberStore } from "@/store/esbabbler/member";

const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
const readMoreMembers = await useReadMembers();
</script>

<template>
  <EsbabblerModelMemberList :members :has-more :read-more-members />
</template>
