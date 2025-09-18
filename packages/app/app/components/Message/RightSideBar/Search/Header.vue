<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { isSearching, totalItemsLength } = storeToRefs(searchMessageStore);
</script>

<template>
  <v-container fluid flex>
    <template v-if="isSearching">
      Searching
      <v-progress-circular size="small" indeterminate />
    </template>
    <template v-else>
      {{ totalItemsLength }} result{{ totalItemsLength === 1 ? "" : "s" }}
      <v-spacer />
      <StyledHelpTooltip text="New messages may take up to 5 minutes to appear." />
    </template>
  </v-container>
</template>
