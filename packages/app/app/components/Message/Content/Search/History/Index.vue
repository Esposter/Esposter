<script setup lang="ts">
import { useDataStore } from "@/store/message/data";

const dataStore = useDataStore();
const { messages } = storeToRefs(dataStore);
// @TODO: Actually grab from search history table
const recentMessages = computed(() => messages.value.slice(0, 10));
</script>

<template>
  <v-card-title text-base font-extrabold>History</v-card-title>
  <v-list py-0 density="compact">
    <MessageContentSearchHistoryMessage v-for="message in recentMessages" :key="message.rowKey" :message />
  </v-list>
</template>
