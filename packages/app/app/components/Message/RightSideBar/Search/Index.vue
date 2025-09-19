<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { isSearching } = storeToRefs(searchMessageStore);
</script>

<template>
  <MessageRightSideBarSearchHeader />
  <v-divider />
  <template v-if="!isSearching">
    <MessageRightSideBarSearchMessages />
  </template>
</template>
