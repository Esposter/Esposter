<script setup lang="ts">
import { SearchFilterComponentMap } from "@/services/message/SearchFilterComponentMap";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { activeSelectedFilter, isSearched } = storeToRefs(searchMessageStore);
</script>

<template>
  <v-menu location="top" :close-on-content-click="false">
    <template #activator="{ props }">
      <MessageContentSearchInput :="props" />
    </template>
    <StyledCard p-2>
      <MessageContentSearchMessages v-if="isSearched" />
      <template v-else>
        <component
          :is="SearchFilterComponentMap[activeSelectedFilter.type]"
          v-if="
            activeSelectedFilter && !activeSelectedFilter.value && SearchFilterComponentMap[activeSelectedFilter.type]
          "
          @select="
            (value: string) => {
              if (!activeSelectedFilter) return;
              activeSelectedFilter.value = value;
            }
          "
        />
        <MessageContentSearchOptions v-else />
        <v-divider mx-4 />
        <MessageContentSearchHistory />
      </template>
    </StyledCard>
  </v-menu>
</template>
