<script setup lang="ts">
import { useMemberStore } from "@/store/message/user/member";

const memberStore = useMemberStore();
const { memberCount } = storeToRefs(memberStore);
</script>

<template>
  <header px-4 py-3 ui-bar>
    <h2 ui-heading>Members — {{ memberCount }}</h2>
  </header>
</template>
