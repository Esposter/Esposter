<script setup lang="ts">
import { SearchFilterComponentMap } from "@/services/message/SearchFilterComponentMap";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { activeSelectedFilter, isSearched } = storeToRefs(searchMessageStore);
</script>

<template>
  <!-- @TODO: Menu should be based on focus of the input -->
  <v-menu location="top" :max-height="500" :close-on-content-click="false">
    <template #activator="{ props }">
      <MessageContentSearchInput :="props" />
    </template>
    <StyledCard p-2>
      <MessageContentSearchMessages v-if="isSearched" />
      <component
        :is="SearchFilterComponentMap[activeSelectedFilter.type]"
        v-else-if="
          activeSelectedFilter && !activeSelectedFilter.value && SearchFilterComponentMap[activeSelectedFilter.type]
        "
        @select="
          (value: string) => {
            if (!activeSelectedFilter) return;
            activeSelectedFilter.value = value;
          }
        "
      />
      <template v-else>
        <MessageContentSearchOptions />
        <v-divider mx-4 />
        <MessageContentSearchHistory />
      </template>
    </StyledCard>
  </v-menu>
</template>
