<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { isSearching, totalItemsLength } = storeToRefs(searchMessageStore);
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col font-bold>Search</v-col>
      <v-col text-right>
        <v-progress-circular v-if="isSearching" size="small" indeterminate />
        <span v-else text-gray>{{ totalItemsLength }} results</span>
      </v-col>
    </v-row>
  </v-container>
  <v-divider />
</template>
