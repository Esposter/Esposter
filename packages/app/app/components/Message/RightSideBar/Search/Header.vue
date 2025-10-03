<script setup lang="ts">
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { isSearching, totalItemsLength } = storeToRefs(searchMessageStore);
</script>

<template>
  <v-container fluid>
    <v-row gap-y-2 no-gutters>
      <v-col cols="12">
        <MessageContentSearchMenu />
      </v-col>
      <v-col flex items-center cols="12">
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
      </v-col>
    </v-row>
  </v-container>
</template>
