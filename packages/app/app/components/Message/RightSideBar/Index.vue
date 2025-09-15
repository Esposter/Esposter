<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { isSearched, isSearching } = storeToRefs(searchMessageStore);
</script>

<template>
  <template v-if="isSearching || isSearched">
    <MessageRightSideBarSearchHeader />
    <v-divider />
    <MessageRightSideBarSearchMessages v-if="isSearched" />
  </template>
  <template v-else>
    <MessageRightSideBarMemberHeader />
    <v-divider />
    <MessageRightSideBarMemberList />
  </template>
</template>
