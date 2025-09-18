<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { isSearching, totalItemsLength } = storeToRefs(searchMessageStore);
</script>

<template>
  <v-container fluid>
    <v-row items-center>
      <v-col font-bold>Search</v-col>
      <v-col flex items-center text-right>
        <v-progress-circular v-if="isSearching" size="small" indeterminate />
        <template v-else>
          <span text-gray text-center>{{ totalItemsLength }} result{{ totalItemsLength === 1 ? "" : "s" }}</span>
          <StyledHelpTooltip pl-2 text="New messages may take up to 5 minutes to appear." />
        </template>
      </v-col>
    </v-row>
  </v-container>
  <v-divider />
</template>
