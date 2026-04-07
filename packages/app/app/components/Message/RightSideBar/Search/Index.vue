<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/search";

const searchMessageStore = useSearchMessageStore();
const { isSearching } = storeToRefs(searchMessageStore);
</script>

<template>
  <MessageRightSideBarSearchHeader />
  <v-divider />
  <MessageRightSideBarSearchMessageList v-if="!isSearching" />
</template>
