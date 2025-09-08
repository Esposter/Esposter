<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { isSearched } = storeToRefs(searchMessageStore);
</script>

<template>
  <v-menu location="top" :close-on-content-click="false">
    <template #activator="{ props }">
      <MessageContentSearchInput :="props" />
    </template>
    <StyledCard p-2>
      <MessageContentSearchMessages v-if="isSearched" />
      <template v-else>
        <MessageContentSearchOptions />
        <MessageContentSearchHistory />
      </template>
    </StyledCard>
  </v-menu>
</template>
