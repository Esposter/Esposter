<script setup lang="ts">
import { SearchFilterComponentMap } from "@/services/message/SearchFilterComponentMap";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { activeSelectedFilter, menu } = storeToRefs(searchMessageStore);
</script>

<template>
  <v-menu
    :model-value="menu"
    location="top"
    persistent
    :close-on-content-click="false"
    :height="500"
    :open-on-click="false"
    @mousedown.prevent
  >
    <template #activator="{ props }">
      <MessageContentSearchInput :="props" />
    </template>
    <StyledCard p-2>
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
      <template v-else>
        <MessageContentSearchOptions />
        <v-divider mx-4 />
        <MessageContentSearchHistory />
      </template>
    </StyledCard>
  </v-menu>
</template>
