<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { isSearching, totalItemsLength } = storeToRefs(searchMessageStore);
</script>

<template>
  <v-container fluid flex items-center>
    <template v-if="isSearching">
      Searching
      <div pl-2>
        <v-progress-circular size="small" indeterminate />
      </div>
    </template>
    <template v-else>
      {{ totalItemsLength }} result{{ totalItemsLength === 1 ? "" : "s" }}
      <v-spacer />
      <StyledHelpTooltip text="New messages may take up to 5 minutes to appear." />
    </template>
  </v-container>
</template>
