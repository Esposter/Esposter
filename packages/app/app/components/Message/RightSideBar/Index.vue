<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { isSearched } = storeToRefs(searchMessageStore);
</script>

<template>
  <template v-if="isSearched">
    <MessageRightSideBarSearchMessages />
  </template>
  <template v-else>
    <MessageRightSideBarMemberHeader />
    <v-divider />
    <MessageRightSideBarMemberList />
  </template>
</template>
