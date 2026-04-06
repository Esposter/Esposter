<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/search";

const searchMessageStore = useSearchMessageStore();
const { isSearching } = storeToRefs(searchMessageStore);
</script>

<template>
  <MessageRightSideBarSearchHeader />
  <v-divider />
  <template v-if="!isSearching">
    <MessageRightSideBarSearchMessageList />
  </template>
</template>
