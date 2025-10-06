<script setup lang="ts">
import type { SerializableValue } from "@esposter/shared";

import { SearchFilterComponentMap } from "@/services/message/SearchFilterComponentMap";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { activeSelectedFilter, menu } = storeToRefs(searchMessageStore);
</script>

<template>
  <v-menu
    v-model="menu"
    location="top"
    :close-on-content-click="false"
    :height="500"
    :open-on-click="false"
    @mousedown.prevent
  >
    <template #activator="{ props }">
      <MessageRightSideBarSearchInput :="props" />
    </template>
    <StyledCard p-2>
      <component
        :is="SearchFilterComponentMap[activeSelectedFilter.type]"
        v-if="
          activeSelectedFilter && !activeSelectedFilter.value && SearchFilterComponentMap[activeSelectedFilter.type]
        "
        @select="
          (value: SerializableValue) => {
            if (!activeSelectedFilter) return;
            activeSelectedFilter.value = value;
          }
        "
      />
      <template v-else>
        <MessageRightSideBarSearchOptions />
        <v-divider mx-4 />
        <MessageRightSideBarSearchHistory />
      </template>
    </StyledCard>
  </v-menu>
</template>
